use std::path::{PathBuf, Path};

use super::{config, utils::{OSType, self}};

pub fn get_app_dir_path() -> PathBuf {

    let app_dir_name = config::APP_DIR_NAME;
    let home_dir = home::home_dir().unwrap();

    match utils::get_os_type() {
        OSType::Windows =>  home_dir.join("AppData").join("Roaming").join(app_dir_name),
        OSType::MacOS => home_dir.join("Library").join("Application Support").join(app_dir_name),
        OSType::Linux => home_dir.join(app_dir_name)
    }
}

pub fn get_instances_dir_path() -> PathBuf {
    self::get_app_dir_path().join("instances")
}

pub fn get_common_dir_path() -> PathBuf {
    self::get_app_dir_path().join("common")
}

// pub fn get_logs_dir_path() -> PathBuf {
//     get_app_dir_path().join("logs")
// }

pub fn combine_common_paths_absolute(absolute_dir: &Path, path: &Path) -> PathBuf {
    self::get_common_dir_path().join(absolute_dir).join(path)
}

pub fn get_caches_dir_path() -> PathBuf {
    self::get_app_dir_path().join("caches")
}

pub fn get_processes_json_file_path() -> PathBuf {
    self::get_caches_dir_path().join("processes.json")
}