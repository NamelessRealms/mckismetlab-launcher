use crate::{download::{DownloadFile, self}, version_metadata::{VersionMetadata, ClientJar}, util::config, libraries::LibrariesJar, assets::AssetObjects};

#[tracing::instrument(skip(version_metadata))]
pub async fn validate_installer(version_metadata: &VersionMetadata) -> Result<(), Box<dyn std::error::Error>> {

    tracing::info!("Validate vanilla game data....");

    let download_queue: Vec<DownloadFile> = {
        let mut queue = Vec::new();
        // 添加客戶端 JAR 檔案到下載佇列
        add_client_jar_to_download_queue(version_metadata.get_client_jar(), &mut queue);
        // 添加資產檔案到下載佇列
        add_asset_objects_to_download_queue(version_metadata.get_asset_objects().await?, &mut queue);
        // 添加庫檔案到下載佇列
        add_libraries_to_download_queue(version_metadata.get_libraries(), &mut queue);
        queue
    };

    // 驗證下載的資產
    download::validate_download_assets(download_queue, config::APP_DOWNLOAD_LIMIT).await?;

    Ok(())
}

fn add_libraries_to_download_queue(libraries: Vec<LibrariesJar>, queue: &mut Vec<DownloadFile>) {
    for lib in libraries.iter() {
        queue.push(DownloadFile {
            name: lib.name.to_string(),
            path: lib.path.to_path_buf(),
            sha1: lib.sha1.to_string(),
            size: lib.size,
            download_url: lib.download_url.to_string(),
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
            download_url: obj.download_url.to_string(),
        });
    }
}

fn add_client_jar_to_download_queue(client_jar: ClientJar, queue: &mut Vec<DownloadFile>) {
    queue.push(DownloadFile {
        name: client_jar.name,
        path: client_jar.path,
        sha1: client_jar.sha1,
        size: client_jar.size,
        download_url: client_jar.download_url,
    });
}