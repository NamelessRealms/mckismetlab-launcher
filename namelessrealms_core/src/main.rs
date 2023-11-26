use namelessrealms_core::{metadata, parameters::BuildParameters, logger, vanilla_download, children::Children, libraries, global_path, loader::{loader::{BuildModLoader, LoaderType}, loader_download, forge::forge_installer::ForgeInstaller}};
use tokio::process::Command;
use uuid::Uuid;

const MINECRAFT_VERSION: &str = "1.15.2";

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {

    let _logger_guard = logger::init_logger();
    let mut children = Children::new();
    children.rescue_cache().await?;

    let vanilla_manifest = metadata::get_vanilla_metadata(MINECRAFT_VERSION).await?;

    // ! Forge 暫時不支援
    // let loader_manifest = BuildModLoader::new("1.5.2", LoaderType::Forge, "7.8.1.738", &vanilla_manifest).get_modloader_manifest().await?;
    // let loader_manifest = BuildModLoader::new("1.6.4", LoaderType::Forge, "9.11.1.1345", &vanilla_manifest).get_modloader_manifest().await?;

    // ? Forge 支援，已測試過
    // let loader_manifest = BuildModLoader::new("1.8.9", LoaderType::Forge, "11.15.1.2318-1.8.9", &vanilla_manifest).get_modloader_manifest().await?;
    // let loader_manifest = BuildModLoader::new("1.7.10", LoaderType::Forge, "10.13.4.1614-1.7.10", &vanilla_manifest).get_modloader_manifest().await?;
    // let loader_manifest = BuildModLoader::new("1.12.2", LoaderType::Forge, "14.23.5.2847", &vanilla_manifest).get_modloader_manifest().await?;
    // let loader_manifest = BuildModLoader::new("1.12.2", LoaderType::Forge, "14.23.5.2860", &vanilla_manifest).get_modloader_manifest().await?;
    let loader_manifest = BuildModLoader::new("1.15.2", LoaderType::Forge, "31.2.50", &vanilla_manifest).get_modloader_manifest().await?;
    // let loader_manifest = BuildModLoader::new("1.16.5", LoaderType::Forge, "36.2.34", &vanilla_manifest).get_modloader_manifest().await?;
    // let loader_manifest = BuildModLoader::new("1.20.2", LoaderType::Forge, "48.0.40", &vanilla_manifest).get_modloader_manifest().await?;

    // println!("{:#?}", loader_manifest.arguments);

    vanilla_download::validate_installer(&vanilla_manifest).await?; // 1
    loader_download::validate_installer(&loader_manifest).await?; // 2

    if let Some(loader_install) = &loader_manifest.loader_install {
        ForgeInstaller::new(&loader_install.data, &vanilla_manifest.get_client_jar()).install(&loader_install.processors).await?; // 3
    }
    
    let jvm_minecraft_parameters = BuildParameters::new(&vanilla_manifest).get_jvm_loader_parameters(&loader_manifest)?;
    // let jvm_minecraft_parameters = BuildParameters::new(&vanilla_manifest).get_jvm_vanilla_parameters()?;

    println!("{:#?}", jvm_minecraft_parameters);

    // let java_path = "/Library/Java/JavaVirtualMachines/jdk-17.0.1.jdk/Contents/Home/bin/java";
    let java_path = "/Library/Java/JavaVirtualMachines/jdk1.8.0_311.jdk/Contents/Home/bin/java";

    let mut child = Command::new(java_path);
    child.args(&jvm_minecraft_parameters.parameters);
    child.current_dir(global_path::get_instances_dir_path().join("mckismetlab-main-server"));

    libraries::extract_natives(vanilla_manifest.get_libraries(), &jvm_minecraft_parameters.natives_dir_path)?;
    let _minecraft_child = children.insert_new_process(Uuid::new_v4(), child).await?;

    // tokio::time::sleep(tokio::time::Duration::from_secs(500)).await;

    Ok(())
}