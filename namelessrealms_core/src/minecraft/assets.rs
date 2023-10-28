use std::{collections::HashMap, path::{PathBuf, Path}};

use serde::Deserialize;
use crate::reqwest_api;
use super::version_metadata::AssetIndex;

#[derive(Debug, Deserialize)]
pub struct AssetObjects {
    pub name: String,
    pub relative_path: PathBuf,
    pub sha1: String,
    pub size: u32,
    pub download_url: String
}

#[derive(Debug, Deserialize)]
struct Object {
    hash: String,
    size: u32
}

#[derive(Debug, Deserialize)]
struct McAssetObjects {
    objects: HashMap<String, Object>
}

pub fn get_asset_objects(asset_index: &AssetIndex) -> Result<Vec<AssetObjects>, Box<dyn std::error::Error>> {

    let url = &asset_index.url;
    let asset_objects = reqwest_api::request_json::<McAssetObjects>(&url)?;
    let asset_objects = iter_map(&asset_objects.objects);

    Ok(asset_objects)
}

fn iter_map(objects: &HashMap<String, Object>) -> Vec<AssetObjects> {

    objects.iter().map(|(_i, object)| {

        let hash = &object.hash;
        let dir_name = hash.chars().take(2).collect::<String>();

        AssetObjects {
            name: hash.to_string(),
            relative_path: Path::new(&dir_name).join(object.hash.clone()),
            sha1: object.hash.to_string(),
            size: object.size,
            download_url: format!("https://resources.download.minecraft.net/{}/{}", dir_name, hash.to_string())
        }
    }).collect::<Vec<AssetObjects>>()
}