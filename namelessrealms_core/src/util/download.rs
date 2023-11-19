use std::{path::{PathBuf, Path}, fs::{self, File}, io::{self, Write}, cmp::min, sync::{Arc, Mutex}};
use futures::StreamExt;
use reqwest::Client;
use sha1::{Sha1, Digest};
use crate::{ErrorKind, util};

#[derive(Debug, Clone)]
pub struct DownloadFile {
    pub name: String,
    pub path: PathBuf,
    pub sha1: String,
    pub size: u32,
    pub download_url: String,
}

// #[tokio::main]
#[tracing::instrument(skip(files))]
pub async fn validate_download_assets(files: Vec<DownloadFile>, limit: usize) -> crate::Result<()> {
    
    let files_len = &files.len();

    tracing::info!("Validate downloading game data total: {}", files_len);

    let mut download_tasks = Vec::new();
    let download_failure: Arc<Mutex<Vec<DownloadFile>>> = Arc::new(Mutex::new(Vec::new()));

    for file in files {

        let download_failure = Arc::clone(&download_failure);

        let file_name = file.name;
        let file_path = file.path;
        let file_sha1 = file.sha1;
        let file_size = file.size;
        let download_url = file.download_url;

        // if utils::is_path_exists(&file_path) {
        //     if sha1_exists(&file_path, sha1)? {
        //         // println!("Local file SHA-1 matches: {}", file_name);
        //         continue;
        //     } else {
        //         debug!("Local file SHA-1 does not match, expected: {}", file_name);
        //     }
        // }

        if util::io::is_path_exists(&file_path) { continue; }

        let handle = tokio::spawn(async move {

            tracing::debug!("Local file does not exist, ready to download: {}", file_name);
            
            match download_file(&download_url, &file_path, &file_name, &file_sha1).await {
                Ok(_) => tracing::debug!("Downloaded file finish: {:?}", file_path),
                Err(error) => {

                    let mut download_failure = download_failure.lock().unwrap();
                    download_failure.push(DownloadFile {
                        name: file_name.clone(),
                        path: file_path,
                        sha1: file_sha1.clone(),
                        size: file_size,
                        download_url: download_url.clone()
                    });

                    tracing::error!("Download failure: {} {}", file_name, error);
                },
            }
        });

        download_tasks.push(handle);

        if download_tasks.len() >= limit {
            futures::future::try_join_all(download_tasks.drain(..)).await?;
        }
    }

    futures::future::try_join_all(&mut download_tasks).await?;

    let download_failure = download_failure.lock().unwrap();
    let download_failure_count = download_failure.len();
    tracing::info!("Validate downloading game data END! Success: {} Failure: {}", files_len - download_failure_count, download_failure_count);

    if download_failure_count > 0 {
        return Err(ErrorKind::DownloadFilesError(download_failure_count).as_error());
    }

    Ok(())
}

#[tracing::instrument]
pub async fn download_file(url: &str, path: &Path, name: &str, sha1: &str) -> crate::Result<()> {

    // 檢查響應是否成功 error_for_status()
    let response = Client::new().get(url).send().await?.error_for_status()?;

    let total_size: u64 = response.content_length().unwrap();
    
    // Create all dir 
    fs::create_dir_all(path.parent().unwrap())?;

    let mut file = File::create(path).or(Err(ErrorKind::CreateFileIOError(path.to_string_lossy().to_string())))?;
    let mut downloaded: u64 = 0;
    let mut stream = response.bytes_stream();

    while let Some(item) = stream.next().await {
        let chunk = item.or(Err(ErrorKind::DownloadFileError(name.to_string())))?;
        file.write_all(&chunk).or(Err(ErrorKind::DownloadFileError(name.to_string())))?;
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
        return Err(ErrorKind::FileSHA1Error(name.to_string()).as_error());
    }

    Ok(())
}

 // 檢查本地檔案的 SHA-1 雜湊值是否匹配
fn sha1_exists(path: &Path, sha1: &str) -> crate::Result<bool> {
    let mut local_file = fs::File::open(path)?;
    let mut hasher = Sha1::new();
    io::copy(&mut local_file, &mut hasher)?;
    let local_hash = format!("{:x}", hasher.finalize());
    Ok(local_hash == sha1.to_string())
}