use crate::{download::{DownloadFile, self}, libraries::LibrariesJar, config};

use super::loader::LoaderVersionInfo;

#[tracing::instrument(skip(forge_loader_manifest))]
pub async fn validate_installer(forge_loader_manifest: &LoaderVersionInfo) -> crate::Result<()> {

    tracing::info!("Validate loader Data...");

    let download_queue: Vec<DownloadFile> = {
        let mut queue = Vec::new();

        // 添加庫檔案到下載佇列
        add_libraries_to_download_queue(&forge_loader_manifest.libraries, &mut queue);

        // 添加 client_lzma 檔案到下載佇列
        add_client_lzma_to_download_queue(&forge_loader_manifest.client_lzma, &mut queue);

        queue
    };

    // 驗證下載的資產
    download::validate_download_assets(download_queue, config::APP_DOWNLOAD_LIMIT).await?;

    Ok(())
}

fn add_client_lzma_to_download_queue(client_lzma: &Option<LibrariesJar>, queue: &mut Vec<DownloadFile>)  {

    // ? If None skip
    let client_lzma = match client_lzma {
        Some(v) => v,
        None => return,
    };

    queue.push(DownloadFile {
        name: client_lzma.name.to_owned(),
        path: client_lzma.path.to_path_buf(),
        sha1: client_lzma.sha1.to_owned(),
        size: client_lzma.size,
        download_url: client_lzma.download_url.to_owned(),
        relative_url: None,
        manifest_url: None,
    });
}

fn add_libraries_to_download_queue(libraries: &Vec<LibrariesJar>, queue: &mut Vec<DownloadFile>) {
    for lib in libraries.iter() {
        queue.push(DownloadFile {
            name: lib.name.to_owned(),
            path: lib.path.to_path_buf(),
            sha1: lib.sha1.to_owned(),
            size: lib.size,
            download_url: lib.download_url.to_owned(),
            relative_url: lib.relative_url.to_owned(),
            manifest_url: lib.manifest_url.to_owned()
        });
    }
}