use std::path::PathBuf;
use uuid::Uuid;
use crate::{version_metadata::VersionMetadata, util::{global_path, utils::{self, OSArch, OSType}, config}};

#[derive(Debug, Clone)]
pub struct JvmMinecraftParameters {
    pub natives_dir_path: PathBuf,
    pub parameters: Vec<String>
}

#[derive(Debug)]
pub struct BuildParameters<'a> {
    version_metadata: &'a VersionMetadata,
    natives_dir_path: PathBuf,
}

impl BuildParameters<'_> {

    pub fn new(version_metadata: &VersionMetadata) -> BuildParameters {

        BuildParameters {
            version_metadata: version_metadata,
            natives_dir_path: global_path::get_common_dir_path().join("bin").join(Uuid::new_v4().to_string().split("-").next().unwrap()),
        }
    }

    #[tracing::instrument(skip(self))]
    pub fn get_jvm_minecraft_parameters(&self) -> JvmMinecraftParameters {

        tracing::debug!("Natives dir path: {:?}", self.natives_dir_path);

        // 如果 Minecraft 版本為 1.13 或更高版本，則獲取相關參數
        let parameters = if utils::is_mc_version("1.13", self.minecraft_version()) {
            self.build_113above()
        } else {
            self.build_112later()
        };

        // 創建 Java 啟動參數結構體
        JvmMinecraftParameters {
            natives_dir_path: self.natives_dir_path.to_path_buf(),
            parameters // 將參數向量設置為 JavaStartParameters 的 parameters 屬性
        }
    }

    // 生成 Minecraft 1.13 及更高版本的啟動參數
    fn build_113above(&self) -> Vec<String> {
 
        let mut parameters: Vec<String> = Vec::new();

        // 添加 JVM 參數
        parameters.extend(self.get_jvm_parameters_for_113_and_above());

        // 添加通用 JVM 參數
        parameters.extend(self.jvm_parameters());

        // 添加主類 mainClass
        parameters.push(self.version_metadata.get_main_class_name().to_string());

        // 添加 Minecraft 遊戲參數
        parameters.extend(self.minecraft_parameters());

        parameters
    }

    // 生成 Minecraft 1.12 及以下版本的啟動參數
    fn build_112later(&self) -> Vec<String> {

        let mut parameters: Vec<String> = Vec::new();

        // 添加 JVM 參數
        parameters.extend(self.get_jvm_parameter_for_112_and_later());

        // 添加通用 JVM 參數
        parameters.extend(self.jvm_parameters());

        // 添加主類 mainClass
        parameters.push(self.version_metadata.get_main_class_name().to_string());

        // 添加 Minecraft 遊戲參數
        parameters.extend(self.minecraft_parameters());

        parameters
    }

    // 生成 Minecraft 1.12 及以下版本的遊戲參數
    // fn minecraft_arguments_for_112_and_later(&self) -> Vec<String> {

    //     let games = self.version_metadata.get_java_parameters().get_game();
    //     let mut game_arguments = Vec::<String>::new();

    //     println!("{:#?}", games);

    //     game_arguments
    // }

    // 獲取 Minecraft 1.12 及以下版本的 JVM 參數
    #[tracing::instrument(skip(self))]
    fn get_jvm_parameter_for_112_and_later(&self) -> Vec<String> {

        let mut jvm_parameters = Vec::<String>::new();

        // parameter 1
        jvm_parameters.push(String::from("-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump"));

        // parameter 2
        if utils::get_os_arch() == OSArch::X86 { jvm_parameters.push(String::from("-Xss1M")) }

        let add_os_info = |parameters: &mut Vec<String>| {
            let os_version = utils::get_os_version();
            match utils::get_os_type() {
                OSType::Windows => {
                    parameters.push(String::from(format!("-Dos.name=Windows {}", os_version)));
                    parameters.push(String::from(format!("-Dos.version={}", os_version)));
                },
                OSType::MacOS => {
                    // ! 不知道什麼原因，所以先暫時禁用
                    // parameter.push(String::from(format!("-Dos.name=Darwin")));
                },
                OSType::Linux => {
                    parameters.push(String::from(format!("-Dos.name=Linux")));
                    parameters.push(String::from(format!("-Dos.version={}", os_version)));
                }
            }
        };

        // parameter 3
        add_os_info(&mut jvm_parameters);
        // parameter 4
        jvm_parameters.push(String::from("-Dminecraft.launcher.brand=mckismetlab-launcher"));
        // parameter 5
        jvm_parameters.push(String::from("-Dminecraft.launcher.version=0.0.1"));
        // parameter 6
        jvm_parameters.push(String::from(format!("-Djava.library.path={}", self.natives_dir_path.to_string_lossy().to_string())));
        // parameter 7
        jvm_parameters.push(String::from("-cp"));
        // parameter 8
        jvm_parameters.push(self.assemble_library_path());

        tracing::debug!("JVM 參數: {:?}", jvm_parameters);

        jvm_parameters
    }

    // 生成 Minecraft 全版本的遊戲參數
    #[tracing::instrument(skip(self))]
    fn minecraft_parameters(&self) -> Vec<String> {

        let games = self.version_metadata.get_java_parameters().get_game();
        let mut game_parameters = Vec::<String>::new();

        let game_instances_dir_path = global_path::get_instances_dir_path().join("mckismetlab-main-server").to_string_lossy().to_string();
        let assets_common_dir_path = global_path::get_common_dir_path().join("assets").to_string_lossy().to_string();

        // 遍歷遊戲參數
        for games in &games.arguments {
            let val = match games.key.as_str() {
                "${auth_player_name}" => "Yu_Cheng",
                "${version_name}" => self.minecraft_version(),
                "${game_directory}" => &game_instances_dir_path,
                "${assets_root}" => &assets_common_dir_path,
                "${assets_index_name}" => self.version_metadata.get_assets_index_id(),
                "${auth_uuid}" => "93ea0589-ec75-4cad-8619-995164382e8d",
                "${auth_access_token}" => "null_token",
                "${user_type}" => "mojang",
                "${version_type}" => "release",
                "${user_properties}" => "{}",
                _ => continue,
            };
            let game_name = &games.name;
            game_parameters.push(game_name.to_string());
            game_parameters.push(val.to_string());
        }

        tracing::debug!("Minecraft 遊戲參數: {:?}", game_parameters);

        game_parameters
    }

    // 生成 JVM 參數
    #[tracing::instrument(skip(self))]
    fn jvm_parameters(&self) -> Vec<String> {

        let mut arguments: Vec<String> = Vec::new();

        let ram_size_max = 4096;
        let ram_size_min = 1024;
        
        if ram_size_max != 0 {
            arguments.push(format!("-Xmx{}M", ram_size_max));
        } else {
            arguments.push("-Xmx2048M".to_string());
        }

        if ram_size_min != 0 {
            arguments.push(format!("-Xms{}M", ram_size_min));
        } else {
            arguments.push("-Xms1024M".to_string());
        }

        tracing::debug!("通用 JVM 參數: {:?}", arguments);

        arguments
    }

    // 獲取 Minecraft 1.13 及更高版本的 JVM 參數
    #[tracing::instrument(skip(self))]
    fn get_jvm_parameters_for_113_and_above(&self) -> Vec<String> {

        let jvms = self.version_metadata.get_java_parameters().get_jvm();
        let mut jvm_parameters: Vec<String> = Vec::new();

        // 添加必需的 JVM 參數
        for required in jvms.required.iter() {
            jvm_parameters.push(required.to_string());
        }

        // 遍歷其他 JVM 參數
        for jvm in jvms.arguments.iter() {
            let jvm_name = &jvm.name;

            // -cp
            if jvm.key.as_str() == "${classpath}" {
                jvm_parameters.push(String::from("-cp"));
                jvm_parameters.push(self.assemble_library_path());
                continue;
            }

            let val = match jvm.key.as_str() {
                "${natives_directory}" => format!("{}={}", jvm_name, self.natives_dir_path.to_str().unwrap()),
                "${launcher_name}" => format!("{}={}", jvm_name, config::APP_NAME),
                "${launcher_version}" => format!("{}={}", jvm_name, config::APP_VERSION),
                _ => continue,
            };
            jvm_parameters.push(val);
        }

        tracing::debug!("JVM 參數: {:?}", jvm_parameters);

        jvm_parameters
    }

    fn assemble_library_path(&self) -> String {

        let metadata_libraries = self.version_metadata.get_libraries();
        let mut libraries: Vec<String> = Vec::new();

        // Add Artifact libraries *.jar paths
        for metadata_lib in metadata_libraries.iter() {
            // ! [LWJGL] Failed to load a library. Possible solutions ERROR
            // if metadata_lib.r#type == LibrariesJarType::Artifact {
            //     libraries.push(metadata_lib.path.to_string_lossy().to_string());
            // }
            libraries.push(metadata_lib.path.to_string_lossy().to_string());
        }

        // Add client.jar path
        libraries.push(self.version_metadata.get_client_jar().path.to_string_lossy().to_string());

        // 根據操作系統類型選擇路徑分隔符
        if utils::get_os_type() == OSType::Windows {
            libraries.join(";") // 在 Windows 系統中使用分號分隔，並回傳值
        } else {
            libraries.join(":") // 在非 Windows 系統中使用冒號分隔，並回傳值
        }
    }

    fn minecraft_version(&self) -> &str {
        self.version_metadata.get_id()
    }
}