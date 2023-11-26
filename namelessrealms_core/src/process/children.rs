use std::{collections::HashMap, sync::Arc, fs, path::Path};

use serde::{Serialize, Deserialize};
use sysinfo::{SystemExt, PidExt, ProcessExt};
use tokio::{
    process::{Child, Command},
    sync::RwLock, task::JoinHandle
};
use uuid::Uuid;

use crate::{global_path, parameters::JvmMinecraftParameters, util::{self, io::IOError}, ErrorKind};

#[derive(Serialize, Deserialize, Debug)]
pub struct ProcessCache {
    pub pid: u32,
    pub uuid: Uuid,
    pub start_time: u64,
    pub name: String,
    pub exe: String,
}

pub struct MinecraftChild {
    pub uuid: Uuid,
    pub manager: Option<JoinHandle<crate::Result<i32>>>,
    pub current_child: Arc<RwLock<ChildType>>,
}

#[derive(Debug)]
pub enum ChildType {
    TokioChild(Child),
    RescuedPID(u32),
}

impl ChildType {

    pub async fn try_wait(&mut self) -> crate::Result<Option<i32>> {
        match self {
            ChildType::TokioChild(child) => Ok(child.try_wait().map_err(IOError::from)?.map(|x| x.code().unwrap_or(0))),
            ChildType::RescuedPID(pid) => {
                let mut system = sysinfo::System::new();
                if !system.refresh_process(sysinfo::Pid::from_u32(*pid)) {
                    return Ok(Some(0));
                }
                let process = system.process(sysinfo::Pid::from_u32(*pid));
                if let Some(process) = process {
                    if process.status() == sysinfo::ProcessStatus::Run {
                        Ok(None)
                    } else {
                        Ok(Some(0))
                    }
                } else {
                    Ok(Some(0))
                }
            }
        }
    }

    pub fn id(&self) -> Option<u32> {
        match self {
            ChildType::TokioChild(child) => child.id(),
            ChildType::RescuedPID(pid) => Some(*pid),
        }
    }

    pub async fn cache_process(&self, uuid: uuid::Uuid) -> crate::Result<()> {

        let pid = match self {
            ChildType::TokioChild(child) => child.id().unwrap_or(0),
            ChildType::RescuedPID(pid) => *pid,
        };

        let mut system = sysinfo::System::new();
        system.refresh_processes();

        let process = system.process(sysinfo::Pid::from_u32(pid)).ok_or_else(|| {
            crate::ErrorKind::LauncherError(format!("找不到子行程 {}", pid))
        })?;

        let start_time = process.start_time();
        let name = process.name().to_string();
        let exe = process.exe().to_string_lossy().to_string();

        let cached_process = ProcessCache {
            pid,
            start_time,
            name,
            exe,
            uuid,
        };

        let processes_file_path = global_path::get_processes_json_file_path();
        let mut children_caches = if let Ok(children_json) = util::io::read_json_file::<HashMap<uuid::Uuid, ProcessCache>>(&processes_file_path).await {
            children_json
        } else {
            HashMap::new()
        };

        children_caches.insert(uuid, cached_process);

        util::io::write_struct_file(&processes_file_path, &children_caches).await?;

        Ok(())
    }

    // 從快取中刪除子行程（即：子行程退出時）
    pub async fn remove_cache(&self, uuid: uuid::Uuid) -> crate::Result<()> {

        let processes_file_path = global_path::get_processes_json_file_path();
        let mut children_caches = if let Ok(children_json) = util::io::read_json_file::<HashMap<uuid::Uuid, ProcessCache>>(&processes_file_path).await {
            children_json
        } else {
            HashMap::new()
        };

        children_caches.remove(&uuid);

        util::io::write_struct_file(&processes_file_path, &children_caches).await?;

        Ok(())
    }
}

pub struct Children(HashMap<Uuid, Arc<RwLock<MinecraftChild>>>);

impl Children {
    pub fn new() -> Self {
        Children(HashMap::new())
    }

    // 從 processes.json 檔案中載入快取的子行程，將它們重新插入到 hashmap 中
    // 這只會在啟動時呼叫一次。 只有與快取子行程（名稱、啟動時間、pid 等）相符的子行程才會重新插入
    pub async fn rescue_cache(&mut self) -> crate::Result<()>  {

        let processes_file_path = global_path::get_processes_json_file_path();

        let mut children_caches = if let Ok(children_json) = util::io::read_json_file::<HashMap<uuid::Uuid, ProcessCache>>(&processes_file_path).await {

            // 用空的 HashMap 覆蓋 processes.json 檔案
            let empty = HashMap::<uuid::Uuid, ProcessCache>::new();
            util::io::write_struct_file(&processes_file_path, &empty).await?;
            children_json

        } else {
            HashMap::new()
        };

        for (_, cache) in children_caches.drain() {
            let uuid = cache.uuid;
            match self.insert_cached_process(cache).await {
                Ok(child) => {
                    self.0.insert(uuid, child);
                }
                Err(e) => tracing::warn!("復原快取子行程失敗 {}: {}", uuid, e),
            }
        }

        Ok(())
    }
    
    #[tracing::instrument(skip(self, uuid, minecraft_command))]
    pub async fn insert_new_process(&mut self, uuid: uuid::Uuid, mut minecraft_command: Command) -> crate::Result<Arc<RwLock<MinecraftChild>>> {

        let child = minecraft_command.spawn()?;
        let child = ChildType::TokioChild(child);

        let pid = child.id().ok_or_else(|| {
            crate::ErrorKind::LauncherError("子行程失敗，無法取得 PID".to_string())
        })?;

        let _ = child.cache_process(uuid).await?;

        let current_child = Arc::new(RwLock::new(child));
        let manager = Some(tokio::spawn(Self::process_manager(
            uuid,
            current_child.clone(),
            pid
        )));

        // Create MinecraftChild
        let minecraft_child = MinecraftChild {
            uuid,
            current_child,
            manager
        };

        let mchild = Arc::new(RwLock::new(minecraft_child));
        self.0.insert(uuid, mchild.clone());

        Ok(mchild)
    }

    pub async fn insert_cached_process(&mut self, cached_process: ProcessCache) -> crate::Result<Arc<RwLock<MinecraftChild>>> {

        {
            let mut system = sysinfo::System::new();
            system.refresh_processes();
            
            let process = system.process(sysinfo::Pid::from_u32(cached_process.pid)).ok_or_else(|| {
                crate::ErrorKind::LauncherError(format!("Could not find process {}", cached_process.pid))
            })?;

            if cached_process.start_time != process.start_time() {
                return Err(ErrorKind::LauncherError(format!("快取子行程 {} 的開始時間與實際子行程不同 {}", cached_process.pid, process.start_time())).into());
            }
            if cached_process.name != process.name() {
                return Err(ErrorKind::LauncherError(format!("快取子行程 {} 的名稱與實際子行程不同 {}", cached_process.pid, process.name())).into());
            }
            if cached_process.exe != process.exe().to_string_lossy() {
                return Err(ErrorKind::LauncherError(format!("快取子行程 {} 的 exe 與實際子行程不同 {}", cached_process.pid, process.exe().to_string_lossy())).into());
            }
        }

        let child = ChildType::RescuedPID(cached_process.pid);

        let pid = child.id().ok_or_else(|| {
            crate::ErrorKind::LauncherError("子行程失敗，無法取得 PID".to_string())
        })?;

        // 重新快取子行程，以便在啟動器重新啟動時可以恢復該子行程
        child.cache_process(cached_process.uuid).await?;

        let current_child = Arc::new(RwLock::new(child));
        let manager = Some(tokio::spawn(Self::process_manager(
            cached_process.uuid,
            current_child.clone(),
            pid
        )));

        // Create MinecraftChild
        let mchild = MinecraftChild {
            uuid: cached_process.uuid,
            current_child,
            manager
        };

        let mchild = Arc::new(RwLock::new(mchild));
        self.0.insert(cached_process.uuid, mchild.clone());
        Ok(mchild)
    }

    async fn process_manager(uuid: uuid::Uuid, current_child: Arc<RwLock<ChildType>>, mut current_pid: u32,) -> crate::Result<i32> {

        let current_child = current_child.clone();

        let minecraft_exit_status;
        loop {
            if let Some(t) = current_child.write().await.try_wait().await? {
                minecraft_exit_status = t;
                break;
            }
        }

        {
            let current_child = current_child.write().await;
            current_child.remove_cache(uuid).await?;
        }

        tracing::info!("退出子行程 {}", minecraft_exit_status);

        Ok(minecraft_exit_status)
    }

    // Returns a ref to the child
    pub fn get(&self, uuid: &Uuid) -> Option<Arc<RwLock<MinecraftChild>>> {
        self.0.get(uuid).cloned()
    }

    // Gets all PID keys
    pub fn keys(&self) -> Vec<Uuid> {
        self.0.keys().cloned().collect()
    }

    // Get exit status of a child by PID
    // Returns None if the child is still running
    pub async fn exit_status(&self, uuid: &Uuid) -> crate::Result<Option<i32>> {
        if let Some(child) = self.get(uuid) {
            let child = child.write().await;
            let status = child.current_child.write().await.try_wait().await?;
            Ok(status)
        } else {
            Ok(None)
        }
    }

    // Gets all PID keys of running children
    pub async fn running_keys(&self) -> crate::Result<Vec<Uuid>> {
        let mut keys = Vec::new();
        for key in self.keys() {
            if let Some(child) = self.get(&key) {
                let child = child.clone();
                let child = child.write().await;
                if child.current_child
                    .write()
                    .await
                    .try_wait()
                    .await?
                    .is_none()
                {
                    keys.push(key);
                }
            }
        }
        Ok(keys)
    }
}