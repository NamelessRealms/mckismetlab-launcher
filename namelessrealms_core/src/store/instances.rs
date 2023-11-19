use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use crate::{global_path, util::{io, self}};

use super::store::ValueGetSet;

#[derive(Serialize, Deserialize, Debug)]
pub struct ModpackFile {
    name: String,
    path: String,
    sha1: String,
    size: i32,
    download_url: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Modpack {
    name: String,
    version: String,
    project_id: i32,
    file_id: i32,
    files: Vec<ModpackFile>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ModLoader {
    r#type: String,
    id: String,
    version: String
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ModuleFile {
    name: String,
    r#type: String,
    action: String,
    project_id: i32,
    file_id: i32,
    file_name: String,
    file_path: String,
    sha1: String,
    size: i32,
    version: String,
    download_url: String,
    user_revert: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Module {
    size: usize,
    modules: Vec<ModuleFile>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct InstanceJson {
    instance_id: String,
    minecraft_version: String,
    modpack: Modpack,
    mod_loader: ModLoader,
    module: Module
}

#[derive(Debug)]
pub struct InstanceStore {
    // id: String,
    path: PathBuf,
    json: InstanceJson,
}

const INSTANCE_JSON: &str = "instances.json";

impl InstanceStore {

    pub async fn init(instance_id: &str) -> crate::Result<Self> {

        let instance_path = global_path::get_instances_dir_path().join(instance_id).join(INSTANCE_JSON);

        let instance = if let Ok(instance_json) = io::read_json_file::<InstanceJson>(&instance_path).await {
            instance_json
        } else {
            InstanceJson {
                instance_id: instance_id.to_string(),
                minecraft_version: String::from("0.0.0"),
                modpack: Modpack {
                    name: String::from(""),
                    version: String::from("0.0.0"),
                    project_id: 0,
                    file_id: 0,
                    files: Vec::new(),
                },
                mod_loader: ModLoader {
                    r#type: String::from(""),
                    id: String::from(""),
                    version: String::from("0.0.0"),
                },
                module: Module {
                    size: 0,
                    modules: Vec::new(),
                },
            }
        };

        util::io::write_struct_file(&instance_path, &instance).await?;

        Ok(InstanceStore {
            json: instance,
            // id: instance_id.to_string(),
            path: instance_path
        })
    }

    pub async fn save(&self) -> crate::Result<()> {
        util::io::write_struct_file(&self.path, &self.json).await?;
        Ok(())
    }

    pub fn modpack_version(&mut self) -> ValueGetSet<String> {
        ValueGetSet(&mut self.json.modpack.version)
    }

    pub fn modpack_name(&mut self) -> ValueGetSet<String> {
        ValueGetSet(&mut self.json.modpack.name)
    }

    pub fn get_modules(&self) -> Vec<ModuleFile> {
        self.json.module.modules.clone()
    }

    pub fn set_modules(&mut self, modules: Vec<ModuleFile>) {
        self.json.module.size = modules.len();
        self.json.module.modules = modules;
    }

    pub fn modpack_project_id(&mut self) -> ValueGetSet<i32> {
        ValueGetSet(&mut self.json.modpack.project_id)
    }

    pub fn modpack_file_id(&mut self) -> ValueGetSet<i32> {
        ValueGetSet(&mut self.json.modpack.file_id)
    }

    pub fn get_mod_loader_type(&self) -> ModLoadersType {
        match self.json.mod_loader.r#type.as_str() {
            "Froge" => ModLoadersType::Forge,
            "Fabric" => ModLoadersType::Fabric,
            _ => ModLoadersType::Unknown
        }
    }

    pub fn set_mod_loader_type(&mut self, r#type: &str) {
        self.json.mod_loader.r#type = r#type.to_string();
    }

    pub fn mod_loader_version(&mut self) -> ValueGetSet<String> {
        ValueGetSet(&mut self.json.mod_loader.version)
    }

    pub fn mod_loader_id(&mut self) -> ValueGetSet<String> {
        ValueGetSet(&mut self.json.mod_loader.id)
    }

    pub fn minecraft_version(&mut self) -> ValueGetSet<String> {
        ValueGetSet(&mut self.json.minecraft_version)
    }
}

pub enum ModLoadersType {
    Forge,
    Fabric,
    Unknown
}