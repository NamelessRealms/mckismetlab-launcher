// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use mckismetlab_launcher_core::java;

#[tauri::command]
fn get_os_type() -> &'static str {
    match std::env::consts::OS {
        "macos" => "osx",
        "windows" => "windows",
        "linux" => "linux",
        _ => "unknown",
    }
}

#[tauri::command]
fn get_java_paths() -> Vec<String> {
    java::search_java_paths()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_os_type, get_java_paths])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
