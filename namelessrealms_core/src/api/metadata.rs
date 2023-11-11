use serde::Deserialize;

use crate::config::MINECRAFT_VERSION_MANIFEST_URL;
use crate::minecraft::version_metadata::VersionMetadata;
use crate::reqwest_api;

#[derive(Debug, Deserialize)]
pub struct MinecraftManifestLatest {
    pub release: String,
    pub snapshot: String,
}

#[derive(Debug, Deserialize)]
pub struct MinecraftManifestVersion {
    pub id: String,
    pub r#type: String,
    pub url: String,
    pub time: String,
    #[serde(rename = "releaseTime")]
    pub release_time: String,
}

#[derive(Debug, Deserialize)]
pub struct MinecraftManifest {
    pub latest: MinecraftManifestLatest,
    pub versions: Vec<MinecraftManifestVersion>
}

#[tracing::instrument]
pub fn get_minecraft_versions_manifest() -> crate::Result<MinecraftManifest> {
    Ok(reqwest_api::request_json::<MinecraftManifest>(MINECRAFT_VERSION_MANIFEST_URL)?)
}

#[tracing::instrument]
pub fn get_minecraft_version_metadata(version: &str) -> Result<VersionMetadata, Box<dyn std::error::Error>> {

    if let Some(versions) = get_minecraft_versions_manifest()?.versions.iter().find(|v| v.id == version) {

        let version_url = &versions.url;
        let metadata = reqwest_api::request_json::<VersionMetadata>(&version_url)?;
        Ok(metadata)
    
    } else {
        Err("Minecraft version metadata not found.")?
    }
}