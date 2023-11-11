use std::{path::{PathBuf, Path}, fs::{self, File}, io::{Write, self}, cmp::min};
use futures::StreamExt;
use reqwest::Client;
use tracing::debug;
use crate::{version_metadata::{VersionMetadata, ClientJar}, utils, assets::AssetObjects, libraries::LibrariesJar};
use sha1::{Sha1, Digest};

#[derive(Debug)]
struct DownloadFile {
    name: String,
    path: PathBuf,
    sha1: String,
    size: u32,
    download_url: String
}

pub fn validate_installer(version_metadata: &VersionMetadata) -> Result<(), Box<dyn std::error::Error>> {

    let download_queue: Vec<DownloadFile> = {
        let mut queue = Vec::new();
        // 添加客戶端 JAR 檔案到下載佇列
        add_client_jar_to_download_queue(version_metadata.get_client_jar(), &mut queue);
        // 添加資產檔案到下載佇列
        add_asset_objects_to_download_queue(version_metadata.get_asset_objects()?, &mut queue);
        // 添加庫檔案到下載佇列
        add_libraries_to_download_queue(version_metadata.get_libraries(), &mut queue);
        queue
    };

    // 驗證下載的資產
    validate_download_assets(download_queue, 5)?;

    Ok(())
}

fn add_libraries_to_download_queue(libraries: Vec<LibrariesJar>, queue: &mut Vec<DownloadFile>) {
    for lib in libraries.iter() {
        queue.push(DownloadFile {
            name: lib.name.to_string(),
            path: lib.path.to_path_buf(),
            sha1: lib.sha1.to_string(),
            size: lib.size,
            download_url: lib.download_url.to_string()
        });
    }
}

fn add_asset_objects_to_download_queue(asset_objects: Vec<AssetObjects>, queue: &mut Vec<DownloadFile>) {
    for obj in asset_objects.iter() {
        queue.push(DownloadFile {
            name: obj.name.to_string(),
            path: obj.path.to_path_buf(),
            sha1: obj.sha1.to_string(),
            size: obj.size,
            download_url: obj.download_url.to_string()
        });
    }
}

fn add_client_jar_to_download_queue(client_jar: ClientJar, queue: &mut Vec<DownloadFile>) {
    queue.push(DownloadFile {
        name: client_jar.name,
        path: client_jar.path,
        sha1: client_jar.sha1,
        size: client_jar.size,
        download_url: client_jar.download_url
    });
}

#[tokio::main]
async fn validate_download_assets(download_files: Vec<DownloadFile>, limit: usize) -> Result<(), Box<dyn std::error::Error>> {
    
    for (_i, file) in download_files.iter().enumerate() {
        
        let file_name = &file.name;
        let file_path = &file.path;
        let download_url = &file.download_url;
        let sha1 = &file.sha1;

        // if utils::is_path_exists(&file_path) {
        //     if sha1_exists(&file_path, sha1)? {
        //         // println!("Local file SHA-1 matches: {}", file_name);
        //         continue;
        //     } else {
        //         debug!("Local file SHA-1 does not match, expected: {}", file_name);
        //     }
        // }

        if utils::is_path_exists(&file_path) { continue; }

        debug!("Local file does not exist, ready to download: {}", file_name);
        download_file(&download_url, file_path, sha1).await?;

        debug!("Downloaded file finish: {:?}", file_path);
    }

    // let mut download_queue = Vec::new();

    // for (i, asset) in assets.iter().enumerate() {
    //     // println!("{} {}", i, asset.file_name);

    //     let file_path = asset.file_path.clone();
    //     let url = asset.url.clone();

    //     let download_task = tokio::spawn(async move {
    //         if !utils::is_path_exists(&file_path) {
    //             // download_file(&url, &file_path);
    //         }
    //     });

    //     download_queue.push(download_task);

    //     // 檢查限制並行下載數量的條件
    //     if download_queue.len() >= limit || i + 1 >= assets.len() {
    //         // 等待當前佇列中的所有下載任務完成
    //         futures::future::join_all(download_queue);
    //         download_queue.clear();
    //     }
    // }

    Ok(())
}

pub async fn download_file(url: &str, path: &Path, sha1: &String) -> Result<(), Box<dyn std::error::Error>> {
    
    let response = Client::new().get(url).send().await.or(Err(format!("Failed to GET from '{}'", &url)))?;

    // 檢查響應是否成功
    if !response.status().is_success() {
        return Err(format!("Failed to GET from '{}', status: {:?}", url, response.status()).into());
    }

    let total_size: u64 = response.content_length().ok_or(format!("Failed to get content length from '{}'", &url))?;
        
    fs::create_dir_all(path.parent().unwrap())?;

    let mut file = File::create(path).or(Err(format!("Failed to create file '{}'", path.to_str().unwrap())))?;
    let mut downloaded: u64 = 0;
    let mut stream = response.bytes_stream();

    while let Some(item) = stream.next().await {
        let chunk = item.or(Err(format!("Error while downloading file")))?;
        file.write_all(&chunk).or(Err(format!("Error while writing to file")))?;
        let new = min(downloaded + (chunk.len() as u64), total_size);
        downloaded = new;

        // println!("File: {}, Downloaded Progress: {}/{}", path.parent().unwrap().to_str().unwrap().split("/").last().unwrap(), new, total_size);
        
        // let progress = format!(
        //     "File: {}, Downloaded Progress: {}/{}",
        //     path.file_name().unwrap().to_str().unwrap(),
        //     downloaded,
        //     total_size
        // );
        // print!("\r{:.<100}", progress);
    }

    // 檢查下载文件的 SHA-1 哈希值是否匹配
    if !sha1_exists(path, sha1)? {
        return Err(format!("Error while downloading file, SHA-1 hash does not match"))?;
    }

    Ok(())
}

// 檢查本地檔案的 SHA-1 雜湊值是否匹配
fn sha1_exists(path: &Path, sha1: &String) -> Result<bool, Box<dyn std::error::Error>> {
    let mut local_file = fs::File::open(path)?;
    let mut hasher = Sha1::new();
    io::copy(&mut local_file, &mut hasher)?;
    let local_hash = format!("{:x}", hasher.finalize());
    Ok(local_hash == sha1.to_string())
}