use std::path::{PathBuf, Path};
use crate::utils;
use super::version_metadata::{Libraries, LibrariesRules};

#[derive(Debug, PartialEq)]
pub enum LibrariesJarType {
    Artifact,
    Natives
}

#[derive(Debug)]
pub struct LibrariesJar {
    pub r#type: LibrariesJarType,
    pub name: String,
    pub relative_path: PathBuf,
    pub sha1: String,
    pub size: u32,
    pub download_url: String
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

        allow_libs.push(LibrariesJar {
            r#type,
            name: item.name.to_string(),
            relative_path: Path::new(&file.path).to_path_buf(),
            sha1: file.sha1.to_string(),
            size: file.size,
            download_url: file.url.to_string()
        });

    }

    // 1.12 Version the following contains.
    if let Some(classifiers) = &item.downloads.classifiers {
    
        let native_file = match utils::get_os_type() {
            utils::OSType::Windows => &classifiers.natives_windows,
            utils::OSType::MacOS => &classifiers.natives_osx,
            utils::OSType::Linux => &classifiers.natives_linux
        }.as_ref().unwrap();

        allow_libs.push(LibrariesJar {
            r#type: LibrariesJarType::Natives,
            name: item.name.to_string(),
            relative_path: Path::new(&native_file.path).to_path_buf(),
            sha1: native_file.sha1.to_string(),
            size: native_file.size,
            download_url: native_file.url.to_string()
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