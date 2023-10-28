// #![allow(dead_code)]
// #![allow(unused_variables)]

use serde::Deserialize;
use crate::assets::{AssetObjects, self};

use super::{libraries, arguments::MinecraftArguments};

#[derive(Debug, Deserialize)]
pub struct Arguments {
    pub game: Vec<serde_json::Value>,
    pub jvm: Vec<serde_json::Value>
}

#[derive(Debug, Deserialize)]
pub struct AssetIndex {
    pub id: String,
    pub sha1: String,
    pub size: u32,
    #[serde(rename = "totalSize")]
    pub total_size: u32,
    pub url: String
}

#[derive(Debug, Deserialize)]
pub struct DownloadsClient {
    pub sha1: String,
    pub size: u32,
    pub download_url: String
}

#[derive(Debug, Deserialize)]
struct Downloads {
    client: DownloadsClient,
    client_mappings: Option<DownloadsClient>,
    server: DownloadsClient,
    server_mappings: Option<DownloadsClient>
}

#[derive(Debug, Deserialize)]
struct JavaVersion {
    component: String,
    #[serde(rename = "majorVersion")]
    major_version: u32
}

#[derive(Debug, Deserialize)]
pub struct LibrariesFile {
    pub path: String,
    pub sha1: String,
    pub size: u32,
    pub url: String
}

#[derive(Debug, Deserialize)]
pub struct LibrariesClassifiers {
    #[serde(rename = "natives-linux")]
    pub natives_linux: Option<LibrariesFile>,
    #[serde(rename = "natives-osx")]
    pub natives_osx: Option<LibrariesFile>,
    #[serde(rename = "natives-windows")]
    pub natives_windows: Option<LibrariesFile>
}

#[derive(Debug, Deserialize)]
pub struct LibrariesDownloads {
    pub artifact: Option<LibrariesFile>,
    pub classifiers: Option<LibrariesClassifiers>
}

#[derive(Debug, Deserialize)]
pub struct LibrariesRulesOS {
    pub name: Option<String>,
    pub arch: Option<String>
}

#[derive(Debug, Deserialize)]
pub struct LibrariesRules {
    pub action: String,
    pub os: Option<LibrariesRulesOS>
}

#[derive(Debug, Deserialize)]
pub struct LibrariesNatives {
    pub linux: Option<String>,
    pub osx: Option<String>,
    pub windows: Option<String>
}

#[derive(Debug, Deserialize)]
pub struct Libraries {
    pub downloads: LibrariesDownloads,
    pub name: String,
    pub natives: Option<LibrariesNatives>,
    pub rules: Option<Vec<LibrariesRules>>
}

#[derive(Debug, Deserialize)]
struct LoggingClientFile {
    id: String,
    sha1: String,
    size: u32,
    url: String
}

#[derive(Debug, Deserialize)]
struct LoggingClient {
    argument: String,
    file: LoggingClientFile,
    r#type: String
}

#[derive(Debug, Deserialize)]
struct Logging {
    client: LoggingClient
}

#[derive(Debug)]
pub enum VersionTypes {
    Release,
    Snapshot,
    OldAlpha,
    Null
}

#[derive(Debug, Deserialize)]
pub struct VersionMetadata {
    arguments: Option<Arguments>,
    #[serde(rename = "assetIndex")]
    asset_index: AssetIndex,
    assets: String,
    #[serde(rename = "complianceLevel")]
    compliance_level: u32,
    downloads: Downloads,
    id: String,
    #[serde(rename = "javaVersion")]
    java_version: JavaVersion,
    libraries: Vec<Libraries>,
    logging: Option<Logging>,
    #[serde(rename = "mainClass")]
    main_class: String,
    #[serde(rename = "minecraftArguments")]
    minecraft_arguments: Option<String>,
    #[serde(rename = "minimumLauncherVersion")]
    minimum_launcher_version: i32,
    #[serde(rename = "releaseTime")]
    release_time: String,
    time: String,
    r#type: String
}

impl VersionMetadata {

    pub fn get_java_start_parameters(&self) -> MinecraftArguments {
        
        let higher_version = &self.arguments;
        let lower_version = &self.minecraft_arguments;
        let version = &self.id;

        MinecraftArguments { higher_version, lower_version, version }
    }

    pub fn get_libraries(&self) -> Vec<libraries::LibrariesJar> {
        libraries::is_libraries(&self.libraries)
    }

    pub fn get_asset_objects(&self) -> Result<Vec<AssetObjects>, Box<dyn std::error::Error>> {
        assets::get_asset_objects(&self.get_asset_index())
    }

    pub fn get_id(&self) -> &str {
        &self.id
    }

    pub fn get_asset_index(&self) -> &AssetIndex {
        &self.asset_index
    }

    pub fn get_client_jar(&self) -> &DownloadsClient {
        &self.downloads.client
    }

    pub fn get_java_vm_version(&self) -> &u32 {
        &self.java_version.major_version
    }

    pub fn get_main_class_name(&self) -> &str {
        &self.main_class
    }

    pub fn get_release_time(&self) -> &str {
        &self.release_time
    }

    pub fn get_type(&self) -> &VersionTypes {
        match self.r#type.as_str() {
            "release" => &VersionTypes::Release,
            "snapshot" => &VersionTypes::Snapshot,
            "old_alpha" => &VersionTypes::OldAlpha,
            _ => &VersionTypes::Null
        }
    }
}