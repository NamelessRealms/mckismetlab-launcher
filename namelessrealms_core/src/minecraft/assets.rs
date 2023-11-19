use std::{collections::HashMap, path::{PathBuf, Path}};

use serde::{Deserialize, Serialize};
use crate::{reqwest_api, util::{global_path, self}};
use super::version_metadata::AssetIndex;

#[derive(Debug, Deserialize)]
pub struct AssetObjects {
    pub name: String,
    pub relative_path: PathBuf,
    pub path: PathBuf,
    pub sha1: String,
    pub size: u32,
    pub download_url: String
}

#[derive(Debug, Deserialize, Serialize)]
struct Object {
    hash: String,
    size: u32
}

#[derive(Debug, Deserialize, Serialize)]
struct McAssetObjects {
    objects: HashMap<String, Object>
}

pub async fn get_asset_objects(asset_index: &AssetIndex, assets_index_id: &str) -> crate::Result<Vec<AssetObjects>> {

    let url = &asset_index.url;
    let asset_objects = reqwest_api::request_json::<McAssetObjects>(&url).await?;

    // TODO: write file
    let asset_path = Path::new(&global_path::get_common_dir_path()).join("assets").join("indexes").join(format!("{}.json", assets_index_id));
    util::io::write_struct_file(&asset_path, &asset_objects).await?;

    let asset_objects = iter_map(&asset_objects.objects);

    Ok(asset_objects)
}

fn iter_map(objects: &HashMap<String, Object>) -> Vec<AssetObjects> {

    objects.iter().map(|(_i, object)| {

        let hash = &object.hash;
        let dir_name = hash.chars().take(2).collect::<String>();

        let relative_path = Path::new(&dir_name).join(object.hash.clone());

        AssetObjects {
            name: hash.to_string(),
            relative_path: relative_path.to_path_buf(),
            path: global_path::combine_common_paths_absolute(&Path::new("assets").join("objects"), &relative_path),
            sha1: object.hash.to_string(),
            size: object.size,
            download_url: format!("https://resources.download.minecraft.net/{}/{}", dir_name, hash.to_string())
        }
    }).collect::<Vec<AssetObjects>>()
}