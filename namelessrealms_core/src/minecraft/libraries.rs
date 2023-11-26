use std::{path::{PathBuf, Path}, fs::{File, self}};
use serde::Deserialize;

use crate::{version_metadata::LibrariesFile, util::{utils, global_path}};
use super::version_metadata::{Libraries, LibrariesRules};

#[derive(Debug, PartialEq, Deserialize)]
pub enum LibrariesJarType {
    Artifact,
    Natives,
    ModLoader,
    ModLoaderLzma
}

#[derive(Debug, Deserialize)]
pub struct LibrariesJar {
    pub r#type: LibrariesJarType,
    pub name: String,
    pub relative_path: PathBuf,
    pub path: PathBuf,
    pub sha1: String,
    pub size: u32,
    pub download_url: String,
    pub relative_url: Option<String>,
    pub manifest_url: Option<Vec<String>>,
    pub include_in_classpath: bool,
}

pub fn is_libraries(libraries: &Vec<Libraries>) -> Vec<LibrariesJar> {

    let mut allow_libs: Vec<LibrariesJar> = Vec::new();

    for lib in libraries.iter() {

        if let Some(rules) = &lib.rules {
            if !is_rules(rules) { continue; }
        }

        add_allow_libs(lib, &mut allow_libs);

    }

    allow_libs
}

fn add_allow_libs(item: &Libraries, allow_libs: &mut Vec<LibrariesJar>) {

    if let Some(file) = &item.downloads.artifact {

        let mut r#type = LibrariesJarType::Artifact;

        // 1.19 Start higher version processing.
        if item.name.contains("natives") {
            r#type = LibrariesJarType::Natives;
        }

        let relative_path = Path::new(&file.path).to_path_buf();

        allow_libs.push(LibrariesJar {
            r#type,
            // name: item.name.to_string(),
            name: file.path.split("/").collect::<Vec<&str>>().last().unwrap().to_string(),
            relative_path: relative_path.to_path_buf(),
            path: global_path::combine_common_paths_absolute(Path::new("libraries"), &relative_path),
            sha1: file.sha1.to_string(),
            size: file.size,
            download_url: file.url.to_string(),
            relative_url: None,
            manifest_url: None,
            include_in_classpath: true,
        });

    }

    // 1.12 Version the following contains.
    if let Some(classifiers) = &item.downloads.classifiers {

        // println!("{:#?}", classifiers);

        let native_file = match utils::get_os_type() {
            utils::OSType::Windows => &classifiers.natives_windows,
            utils::OSType::MacOS => {
                // ! libraries natives 包含多種命名方式 Ex: natives-macos or natives-osx
                let mut val: &Option<LibrariesFile> = &None;
                if classifiers.natives_osx.is_some() {
                    val = &classifiers.natives_osx;
                } else if classifiers.natives_macos.is_some() {
                    val = &classifiers.natives_macos;
                }
                val
            },
            utils::OSType::Linux => &classifiers.natives_linux
        }.as_ref();

        // ! 不知道什麼原因 libraries classifiers 可能沒有對應的 OS Data，這邊先暫時跳過
        if native_file.is_none() {
            return;
        }

        let native_file = native_file.unwrap();
        let relative_path = Path::new(&native_file.path).to_path_buf();

        allow_libs.push(LibrariesJar {
            r#type: LibrariesJarType::Natives,
            // name: item.name.to_string(),
            name: native_file.path.split("/").collect::<Vec<&str>>().last().unwrap().to_string(),
            relative_path: relative_path.to_path_buf(),
            path: global_path::combine_common_paths_absolute(Path::new("libraries"), &relative_path),
            sha1: native_file.sha1.to_string(),
            size: native_file.size,
            download_url: native_file.url.to_string(),
            relative_url: None,
            manifest_url: None,
            include_in_classpath: true,
        });
    }
}

pub fn is_rules(rules: &Vec<LibrariesRules>) -> bool {

    let os_type = || {
        match utils::get_os_type() {
            utils::OSType::Windows => "windows",
            utils::OSType::MacOS => "osx",
            utils::OSType::Linux => "linux"
        }.to_string()
    };

    let os_arch = || {
        match utils::get_os_arch() {
            utils::OSArch::X86 => "x86",
            utils::OSArch::X86_64 => "x64",
            utils::OSArch::Aarch64 => "arm"
        }.to_string()
    };

    for rule in rules.iter() {
        
        if rule.action == "allow" {
            if let Some(os) = &rule.os {

                if let Some(os_name) = os.name.as_ref() {
                    return os_type() == os_name.to_string();
                } else if let Some(os_arch_name) = os.arch.as_ref() {
                    return os_arch() == os_arch_name.to_string()
                }

            }
        }

        if rule.action == "disallow" {
            if let Some(os) = &rule.os {
                if let Some(os_name) = os.name.as_ref() {
                    return os_type() != os_name.to_string();
                }
            }
        }
    }

    true
}

pub fn extract_natives(libraries: Vec<LibrariesJar>, natives_dir_path: &Path) -> Result<(), Box<dyn std::error::Error>> {

    fs::create_dir_all(natives_dir_path)?;
    let natives_libraries = libraries.iter().filter(|item| item.r#type == LibrariesJarType::Natives);

    for native_lib in natives_libraries {
        let zip_file = File::open(native_lib.path.to_path_buf())?;
        let mut archive = zip::ZipArchive::new(zip_file)?;
        archive.extract(natives_dir_path)?;

        // for i in 0..archive.len() {
        //     let mut file = archive.by_index(i).unwrap();
        //     println!("{}", file.name());
        //     let mut outpath = std::env::current_dir().unwrap();
        //     outpath.push(Path::new(natives_dir_path).join(file.name()));
        //     if (&*file.name()).ends_with('/') {
        //         std::fs::create_dir_all(outpath).unwrap();
        //     } else {
        //         let mut outfile = std::fs::File::create(outpath).unwrap();
        //         std::io::copy(&mut file, &mut outfile).unwrap();
        //     }
        // }
    }

    tracing::info!("Extraction natives completed: {}", natives_dir_path.to_string_lossy().to_string());

    Ok(())
}