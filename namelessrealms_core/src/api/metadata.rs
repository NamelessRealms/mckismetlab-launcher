use std::path::Path;

use serde::Deserialize;

use crate::minecraft::version_metadata::VersionMetadata;
use crate::{reqwest_api, util};
use crate::util::{config, global_path};

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
pub async fn get_versions_manifest() -> crate::Result<MinecraftManifest> {
    Ok(reqwest_api::request_json::<MinecraftManifest>(config::MINECRAFT_VERSION_MANIFEST_URL).await?)
}

#[tracing::instrument]
pub async fn get_vanilla_metadata(version: &str) -> Result<VersionMetadata, Box<dyn std::error::Error>> {

    if let Some(versions) = get_versions_manifest().await?.versions.iter().find(|v| v.id == version) {

        let version_url = &versions.url;
        let metadata = reqwest_api::request_json::<VersionMetadata>(&version_url).await?;

        // TODO: write file
        let metadata_path = Path::new(&global_path::get_common_dir_path()).join("versions").join(&metadata.get_id()).join(format!("{}.json", &metadata.get_id()));
        util::io::write_struct_file(&metadata_path, &metadata).await?;

        Ok(metadata)
    
    } else {
        Err("未找到 Minecraft 版本元數據。")?
    }
}