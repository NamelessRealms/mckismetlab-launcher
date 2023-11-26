use std::{path::PathBuf, collections::HashMap};
use uuid::Uuid;
use crate::{version_metadata::VersionMetadata, util::{global_path, utils::{self, OSArch, OSType}, config}, arguments::Argument, loader::loader::{LoaderVersionInfo, ForgeJvmArgumentType, parse_forge_loader_version}, FORGE_MANIFEST_V3_QUERY_P1};

#[derive(Debug, Clone)]
pub struct JvmMinecraftParameters {
    pub natives_dir_path: PathBuf,
    pub parameters: Vec<String>
}

#[derive(Debug)]
pub struct BuildParameters<'a, 'b> {
    version_metadata: &'a VersionMetadata,
    loader_manifest: Option<&'b LoaderVersionInfo>,
    natives_dir_path: PathBuf,
}

impl<'a, 'b> BuildParameters<'a, 'b> {

    pub fn new(version_metadata: &'a VersionMetadata) -> BuildParameters<'a, 'b> {

        BuildParameters {
            version_metadata,
            loader_manifest: None,
            natives_dir_path: global_path::get_common_dir_path().join("bin").join(Uuid::new_v4().to_string().split("-").next().unwrap()),
        }
    }

    #[tracing::instrument(skip(self, loader_manifest))]
    pub fn get_jvm_loader_parameters(&mut self, loader_manifest: &'b LoaderVersionInfo) -> crate::Result<JvmMinecraftParameters> {

        self.loader_manifest = Some(loader_manifest);

        let parameters = self.build_jvm_parameters(true)?;

        // 創建 Java 啟動參數結構體
        Ok(JvmMinecraftParameters {
            natives_dir_path: self.natives_dir_path.to_path_buf(),
            parameters // 將參數向量設置為 JavaStartParameters 的 parameters 屬性
        })
    }

    #[tracing::instrument(skip(self))]
    pub fn get_jvm_vanilla_parameters(&self) -> crate::Result<JvmMinecraftParameters> {

        tracing::debug!("Natives dir path: {:?}", self.natives_dir_path);

        let parameters = self.build_jvm_parameters(false)?;

        // 創建 Java 啟動參數結構體
        Ok(JvmMinecraftParameters {
            natives_dir_path: self.natives_dir_path.to_path_buf(),
            parameters // 將參數向量設置為 JavaStartParameters 的 parameters 屬性
        })
    }

    fn build_jvm_parameters(&self, loader: bool) -> crate::Result<Vec<String>> {
        // 如果 Minecraft 版本為 1.13 或更高版本，則獲取相關參數
        let parameters = if utils::is_mc_version("1.13", self.minecraft_version()) {
            self.build_113above()?
        } else {
            self.build_112later()?
        };
        Ok(parameters)
    }

    // 生成 Minecraft 1.13 及更高版本的啟動參數
    fn build_113above(&self) -> crate::Result<Vec<String>> {
 
        let mut parameters: Vec<String> = Vec::new();

        // * 添加 JVM 參數
        parameters.extend(self.get_jvm_parameters_for_113_and_above());

        // * 添加 Loader JVM 參數
        {
            if self.loader_manifest.is_some() {
                if let Some(loader_jvm_parameters) = self.get_loader_jvm_parameters()? {
                    parameters.extend(loader_jvm_parameters);
                }
            }
        }

        // * 添加 classpath 參數
        parameters.extend(self.get_classpath()?);

        // * 添加通用 JVM 參數
        parameters.extend(self.jvm_parameters());

        // * 添加主類 mainClass
        {
            if let Some(loader_manifest) = self.loader_manifest {
                parameters.push(loader_manifest.main_class.to_owned());
            } else {
                parameters.push(self.version_metadata.get_main_class_name().to_owned());
            }
        }

        // * 添加 Minecraft 遊戲參數
        {
            let minecraft_parameters: Vec<String> = self.minecraft_parameters()
                .iter()
                .flat_map(|minecraft_parameter| minecraft_parameter.as_array())
                .collect();

            parameters.extend(minecraft_parameters);

            // * 添加 Loader 遊戲參數
            if self.loader_manifest.is_some() {
                let loader_minecraft_parameters: Vec<String> = self.loader_minecraft_parameters()?
                    .iter()
                    .flat_map(|minecraft_parameter| minecraft_parameter.as_array())
                    .collect();

                parameters.extend(loader_minecraft_parameters);
            }
        }

        Ok(parameters)
    }

    #[tracing::instrument(skip(self))]
    fn get_loader_jvm_parameters(&self) -> crate::Result<Option<Vec<String>>> {

        let loader_manifest = self.loader_manifest.ok_or_else(|| {
            crate::ErrorKind::LoaderError("Get loader Failure".to_owned())
        })?;

        if !FORGE_MANIFEST_V3_QUERY_P1.matches(&parse_forge_loader_version(&loader_manifest.id)?) {
            return Ok(None);
        }

        let jvm_arguments = loader_manifest.arguments.jvm.as_ref().ok_or_else(|| {
            crate::ErrorKind::LoaderError("Get loader jvm arguments Failure".to_owned())
        })?;

        let libraries_dir_path = global_path::get_common_dir_path().join("libraries");
        let mut jvm_parameters: Vec<String> = Vec::new();

        for jvm_argument in jvm_arguments.iter() {

            let name = &jvm_argument.name;
            let mut value = jvm_argument.value.clone();

            if let Some(keys) = &jvm_argument.keys {
                
                let mut new_keys = HashMap::<String, String>::new();

                for (key, _value) in keys.into_iter() {

                    let val: &str = match key.as_str() {
                        "${version_name}" => &loader_manifest.loader_version,
                        "${library_directory}" => &libraries_dir_path.to_str().unwrap(),
                        "${classpath_separator}" => {
                            // 根據操作系統類型選擇路徑分隔符
                            &if utils::get_os_type() == OSType::Windows {
                                ";" // 在 Windows 系統中使用分號分隔，並回傳值
                            } else {
                                ":" // 在非 Windows 系統中使用冒號分隔，並回傳值
                            }
                        },
                        _ => {
                            tracing::warn!("Loader Jvm argument not match: {}", key);
                            &key
                        }
                    };

                    new_keys.insert(key.to_owned(), val.to_owned());
                }

                for (key, new_value) in new_keys.iter() {
                    value = value.replace(key, new_value);
                }
            }

            match jvm_argument.r#type {
                ForgeJvmArgumentType::Space => {
                    jvm_parameters.push(name.to_owned());
                    jvm_parameters.push(value.to_owned());
                },
                ForgeJvmArgumentType::Equal => {
                    jvm_parameters.push(format!("{}={}", name, value));
                },
            }

        }

        // println!("{:#?}", jvm_parameters);

        Ok(Some(jvm_parameters))
    }

    // 生成 Minecraft 1.12 及以下版本的啟動參數
    fn build_112later(&self) -> crate::Result<Vec<String>> {

        let mut parameters: Vec<String> = Vec::new();

        // * 添加 JVM 參數
        parameters.extend(self.get_jvm_parameter_for_112_and_later());

        // * 添加 classpath 參數
        parameters.extend(self.get_classpath()?);

        // *  添加通用 JVM 參數
        parameters.extend(self.jvm_parameters());

        // * 添加主類 mainClass
        {
            if let Some(loader_manifest) = self.loader_manifest {
                parameters.push(loader_manifest.main_class.to_owned());
            } else {
                parameters.push(self.version_metadata.get_main_class_name().to_owned());
            }
        }

        // * 添加 Minecraft 遊戲參數
        {
            let minecraft_parameters: Vec<String> = self.minecraft_parameters()
                .iter()
                .flat_map(|minecraft_parameter| minecraft_parameter.as_array())
                .collect();

            parameters.extend(minecraft_parameters);
            
            // * 添加 Loader 遊戲參數
            if self.loader_manifest.is_some() {
                let loader_minecraft_parameters: Vec<String> = self.loader_minecraft_parameters()?
                    .iter()
                    .flat_map(|minecraft_parameter| minecraft_parameter.as_array())
                    .collect();

                parameters.extend(loader_minecraft_parameters);
            }
        }

        Ok(parameters)
    }

    // 生成 Minecraft 1.12 及以下版本的遊戲參數
    // fn minecraft_arguments_for_112_and_later(&self) -> Vec<String> {

    //     let games = self.version_metadata.get_java_parameters().get_game();
    //     let mut game_arguments = Vec::<String>::new();

    //     println!("{:#?}", games);

    //     game_arguments
    // }

    // #[tracing::instrument(skip(self))]
    // fn get_loader_classpath(&self) -> crate::Result<Vec<String>> {
    //     let mut classpath = Vec::new();
    //     classpath.push("-cp".to_owned());
    //     classpath.push(self.assemble_library_path()?);
    //     tracing::trace!("Loader Classpath 參數: {:?}", classpath);
    //     Ok(classpath)
    // }

    #[tracing::instrument(skip(self))]
    fn get_classpath(&self) -> crate::Result<Vec<String>> {
        let mut classpath = Vec::new();
        classpath.push("-cp".to_owned());
        classpath.push(self.assemble_library_path()?);
        tracing::trace!("Classpath 參數: {:?}", classpath);
        Ok(classpath)
    }

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

        tracing::debug!("JVM 參數: {:?}", jvm_parameters);

        jvm_parameters
    }

    // 生成 Minecraft 全版本的遊戲參數
    #[tracing::instrument(skip(self))]
    fn minecraft_parameters(&self) -> Vec<Argument> {

        let games = self.version_metadata.get_java_parameters().get_game();
        // let mut game_parameters = Vec::<String>::new();

        let game_instances_dir_path = global_path::get_instances_dir_path().join("mckismetlab-main-server").to_string_lossy().to_string();
        let assets_common_dir_path = global_path::get_common_dir_path().join("assets").to_string_lossy().to_string();

        // ! Old
        // 遍歷遊戲參數
        // for games in &games.arguments {
        //     let val = match games.key.as_str() {
        //         "${auth_player_name}" => "Yu_Cheng",
        //         "${version_name}" => self.minecraft_version(),
        //         "${game_directory}" => &game_instances_dir_path,
        //         "${assets_root}" => &assets_common_dir_path,
        //         "${assets_index_name}" => self.version_metadata.get_assets_index_id(),
        //         "${auth_uuid}" => "93ea0589-ec75-4cad-8619-995164382e8d",
        //         "${auth_access_token}" => "null_token",
        //         "${user_type}" => "mojang",
        //         "${version_type}" => "release",
        //         "${user_properties}" => "{}",
        //         _ => continue,
        //     };
        //     let game_name = &games.name;
        //     game_parameters.push(game_name.to_string());
        //     game_parameters.push(val.to_string());
        // }
        
        // * 遍歷遊戲參數
        let mut games_arguments = games.arguments.clone();
        let game_parameters: Vec<Argument> = games_arguments.iter_mut()
            .map(|value| {

                let val = match value.key.as_str() {
                    "${auth_player_name}" => "Yu_Cheng".to_owned(),
                    "${version_name}" => self.minecraft_version().to_owned(),
                    "${game_directory}" => game_instances_dir_path.clone(),
                    "${assets_root}" => assets_common_dir_path.clone(),
                    "${assets_index_name}" => self.version_metadata.get_assets_index_id().to_owned(),
                    "${auth_uuid}" => "93ea0589-ec75-4cad-8619-995164382e8d".to_owned(),
                    "${auth_access_token}" => "null_token".to_owned(),
                    "${user_type}" => "mojang".to_owned(),
                    "${version_type}" => "release".to_owned(),
                    "${user_properties}" => "{}".to_owned(),
                    _ => value.value.clone(),
                };
                value.value = val;
                value.clone()

            }).collect();

        tracing::debug!("Minecraft 遊戲參數: {:?}", game_parameters);

        game_parameters
    }

    fn loader_minecraft_parameters(&self) -> crate::Result<Vec<Argument>> {

        let loader_manifest = self.loader_manifest.ok_or_else(|| {
            crate::ErrorKind::LoaderError("Get loader Failure".to_owned())
        })?;

        let mut loader_java_game = loader_manifest.arguments.game.clone();

        let _ = loader_java_game.iter_mut()
            .map(|value| {

                let val = match value.key.as_str() {
                    // TODO
                    _ => value.value.to_owned()
                };
                value.value = val.to_owned();
                value

            }).collect::<Vec<&mut Argument>>();

        Ok(loader_java_game)
    }

    // 生成 JVM 參數
    #[tracing::instrument(skip(self))]
    fn jvm_parameters(&self) -> Vec<String> {

        let mut arguments: Vec<String> = Vec::new();

        let ram_size_max = 8192;
        let ram_size_min = 2048;
        
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

        // * macos arch64
        // ? Flx GLFW error before init: [0x10008]Cocoa: Failed to find service port for display
        if utils::get_os_type() == OSType::MacOS && utils::get_os_arch() == OSArch::Aarch64 {
            arguments.push("-Dfml.earlyprogresswindow=false".to_owned());
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
            // if jvm.key.as_str() == "${classpath}" {
            //     jvm_parameters.push(String::from("-cp"));
            //     jvm_parameters.push(self.assemble_library_path());
            //     continue;
            // }

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

    #[tracing::instrument(skip(self))]
    fn assemble_library_path(&self) -> crate::Result<String> {

        let metadata_libraries = self.version_metadata.get_libraries();
        let mut libraries: Vec<String> = Vec::new();

        // * Loader
        {
            // let loader_manifest = self.loader_manifest.ok_or_else(|| {
            //     crate::ErrorKind::LoaderError("Get loader failure".to_owned())
            // })?;
            if let Some(loader_manifest) = self.loader_manifest {
                for loader_library in loader_manifest.libraries.iter() {
                    if loader_library.include_in_classpath {
                        libraries.push(loader_library.path.to_string_lossy().to_string());
                    }
                }
            }
        }

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
            Ok(libraries.join(";")) // 在 Windows 系統中使用分號分隔，並回傳值
        } else {
            Ok(libraries.join(":")) // 在非 Windows 系統中使用冒號分隔，並回傳值
        }
    }

    fn minecraft_version(&self) -> &str {
        self.version_metadata.get_id()
    }
}