// use std::path::Path;

// pub fn is_path_exists(path: &Path) -> bool {
//     match Path::try_exists(path) {
//         Ok(value) => value,
//         Err(_) => false
//     }
// }

pub enum OSType {
    Windows,
    MacOS,
    Linux
}

pub fn get_os_type() -> OSType {
    match std::env::consts::OS {
        "windows" => OSType::Windows,
        "macos" => OSType::MacOS,
        "linux" => OSType::Linux,
        _ => panic!("Unknown OS type")
    }
}

pub enum OSArch {
    X86,
    X86_64,
    Aarch64
}

pub fn get_os_arch() -> OSArch {
    match std::env::consts::ARCH {
        "x86" => OSArch::X86,
        "x86_64" => OSArch::X86_64,
        "aarch64" => OSArch::Aarch64,
        _ => panic!("Unknown OS type")
    }
}

pub fn is_mc_version(desired: &str, actual: &str) -> bool {

    let des: Vec<&str> = desired.split(".").collect();
    let act: Vec<&str> = actual.split(".").collect();

    for i in 0..des.len() {
        if act.get(i).and_then(|a| a.parse::<u32>().ok())
            .map_or(false, |act_num| act_num < des[i].parse::<u32>().unwrap_or(0)) {
            return false;
        }
    }

    true
}