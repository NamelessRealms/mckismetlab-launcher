use std::collections::HashMap;

use daedalus::modded::{SidedDataEntry, Processor};
use regex::Regex;
use tokio::process::Command;

use crate::{global_path, loader::loader, utils::{self, OSType}, version_metadata::ClientJar};

/// Regex: --
const REGEX_1: &str = r"^--";
/// Regex: [[]]
const REGEX_2: &str = r"\[[^}]*\]";
/// Regex: {}
const REGEX_3: &str = r"\{[^}]*\}";

#[derive(Debug)]
pub struct Argument {
    key: String,
    value: String
}

impl Argument {
    pub fn as_array(&self) -> Vec<String> {
        vec![self.key.clone(), self.value.clone()]
    }
}

#[derive(Debug)]
pub struct ForgeInstaller<'a> {
    data_key_map: &'a HashMap<String, SidedDataEntry>,
    minecraft_client_jar: &'a ClientJar,
}

impl<'a> ForgeInstaller<'a> {

    #[tracing::instrument()]
    pub fn new(data_key_map: &'a HashMap<String, SidedDataEntry>, minecraft_client_jar: &'a ClientJar) -> Self {
        ForgeInstaller {
            data_key_map,
            minecraft_client_jar
        }
    }

    #[tracing::instrument(skip(self, processors))]
    pub async fn install(&self, processors: &Vec<Processor>) -> crate::Result<()> {

        for processor in processors.iter() {

            let main_class = self.parse_main_class(&processor.jar);
            let classpath = self.get_classpath(&processor.classpath, &processor.jar)?;

            let args = &processor.args;

            let regex_1 = Regex::new(REGEX_1).unwrap();
            let regex_2 = Regex::new(REGEX_2).unwrap();
            let regex_3 = Regex::new(REGEX_3).unwrap();

            let mut arguments: Vec<Argument> = Vec::new();
            for (i, value) in args.iter().enumerate() {

                // let mut val = "".to_owned();

                // println!("{:#?} {:#?}", value, !regex_1.is_match(&value));

                if !regex_1.is_match(&value) {

                    let mut val = match value {
                        _ => value.to_owned()
                    };

                    if regex_2.is_match(&value) || regex_3.is_match(&value) {
                        val = self.get_data_key_value(&value)?;
                    }

                    arguments.push(Argument {
                        key: args[i - 1].to_string(),
                        value: val
                    });
                }
            }

            let arguments: Vec<String> = arguments
                .iter()
                .flat_map(|parameter| parameter.as_array())
                .collect();

            // Add parameters
            let mut parameters: Vec<String> = Vec::new();
            parameters.push("-cp".to_owned());
            parameters.push(classpath);
            parameters.push(main_class.to_owned());
            parameters.extend(arguments);

            let java_jvm_path = "/Library/Java/JavaVirtualMachines/jdk1.8.0_311.jdk/Contents/Home/bin/java";

            self.build_child(&java_jvm_path, &parameters).await?;
        }

        Ok(())
    }

    #[tracing::instrument(skip(self, java_jvm_path, parameters))]
    async fn build_child(&self, java_jvm_path: &str, parameters: &Vec<String>) -> crate::Result<()> {

        let mut child = Command::new(java_jvm_path)
            .args(parameters)
            .spawn()?;

        match child.try_wait() {
            Ok(Some(status)) => tracing::info!("Forge installer Exited with: {status}"),
            Ok(None) => {
                tracing::info!("Forge installer child Run.");
                let res = child.wait().await?;
                tracing::info!("Forge installer Result: {}", res);
            }
            Err(e) => {
                return Err(crate::ErrorKind::LoaderError(e.to_string()).as_error());
            },
        }

        Ok(())
    }

    #[tracing::instrument(skip(self))]
    fn parse_main_class(&self, value: &str) -> &str {
        // println!("{:#?}", value);
        // * net.minecraftforge:installertools:1.2.6 -> Get installertools
        let split = value.split(":").collect::<Vec<&str>>();
        match split[1] {
            "installertools" => "net.minecraftforge.installertools.ConsoleTool",
            "jarsplitter" => "net.minecraftforge.jarsplitter.ConsoleTool",
            "SpecialSource" => "net.md_5.specialsource.SpecialSource",
            "binarypatcher" => "net.minecraftforge.binarypatcher.ConsoleTool",
            _ => panic!("Parse jar main class Error.")
        }
    }

    #[tracing::instrument(skip(self))]
    fn get_data_key_value(&self, key: &str) -> crate::Result<String> {

        let libraries_dir_path = global_path::get_common_dir_path().join("libraries");

        // * if {}
        if Regex::new(REGEX_3).unwrap().is_match(key) {

            let key = Regex::new(r"^\{|\}$").unwrap().replace_all(key, "").to_string();

            if key == "MINECRAFT_JAR" {
                return Ok(self.minecraft_client_jar.path.to_string_lossy().to_string());
            }

            let client_data_key = &self.data_key_map.get(&key).ok_or_else(|| {
                crate::ErrorKind::LoaderError("Get [data_key_map] error".to_owned())
            })?.client;

            return Ok(self.get_data_key_value(client_data_key)?);
        }

        // * if []
        if Regex::new(REGEX_2).unwrap().is_match(key) {
            let key = Regex::new(r"^\[|\]$").unwrap().replace_all(key, "").to_string();
            return Ok(libraries_dir_path.join(loader::parse_group_relative_path(&key)?).to_string_lossy().to_string());
        }

        Err(crate::ErrorKind::LoaderError("Get data key value error".to_owned()).as_error())
    }

    #[tracing::instrument(skip(self))]
    fn get_classpath(&self, classpath: &Vec<String>, lib_tool_jar: &str) -> crate::Result<String> {

        let mut libraries_path = Vec::new();
        let libraries_dir_path = global_path::get_common_dir_path().join("libraries");

        libraries_path.push(libraries_dir_path.join(loader::parse_group_relative_path(&lib_tool_jar)?).to_string_lossy().to_string());

        for name in classpath.iter() {
            let relative_file_path = &loader::parse_group_relative_path(&name)?;
            libraries_path.push(libraries_dir_path.join(relative_file_path).to_string_lossy().to_string());
        }

        Ok(self.assemble_library_path(libraries_path))
    }

    #[tracing::instrument(skip(self))]
    fn assemble_library_path(&self, libraries_path: Vec<String>) -> String {

        let mut libraries: Vec<String> = Vec::new();

        for library in libraries_path.iter() {
            libraries.push(library.to_owned());
        }
        
        // 根據操作系統類型選擇路徑分隔符
        if utils::get_os_type() == OSType::Windows {
            libraries.join(";") // 在 Windows 系統中使用分號分隔，並回傳值
        } else {
            libraries.join(":") // 在非 Windows 系統中使用冒號分隔，並回傳值
        }
    }
}