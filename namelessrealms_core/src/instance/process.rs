use std::{process::Command, fs};
use crate::{parameters::JvmMinecraftParameters, global_path, libraries, version_metadata::VersionMetadata};

pub fn build_minecraft_command(java_start_parameters: &JvmMinecraftParameters, version_metadata: &VersionMetadata) -> Result<() , Box<dyn std::error::Error>> {
    
    libraries::extract_natives(version_metadata.get_libraries(), &java_start_parameters.natives_dir_path)?;
    // let game_path = global_path::get_instances_dir_path().join("mckismetlab-main-server");
    // fs::create_dir_all(&game_path)?;

    tracing::info!("{:#?}", java_start_parameters.parameters);

    let java_path = "/Library/Java/JavaVirtualMachines/jdk-17.0.1.jdk/Contents/Home/bin/java";
    // let java_path = "/Library/Java/JavaVirtualMachines/jdk1.8.0_311.jdk/Contents/Home/bin/java";

    let child = Command::new(java_path)
        .args(&java_start_parameters.parameters)
        // .current_dir(&game_path)
        .spawn();

    Ok(())
}