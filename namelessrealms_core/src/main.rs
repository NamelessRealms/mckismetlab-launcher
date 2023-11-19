use namelessrealms_core::{metadata, parameters::BuildParameters, logger, vanilla_download, children::Children, libraries, process, global_path, instances::InstanceStore, launcher::LauncherStore, modloader::modloader::BuildModLoaderParameters};
use tokio::process::Command;
use uuid::Uuid;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {

    let _logger_guard = logger::init_logger();

    let _ = BuildModLoaderParameters::new("1.16.5", "forge-36.2.34");

    // let mut children = Children::new();

    // match metadata::get_minecraft_version_metadata("1.16.5").await {
    //     Ok(value) => {

    //         match vanilla_download::validate_installer(&value).await {
    //             Ok(_) => tracing::info!("Download successfully."),
    //             Err(error) => {
    //                 tracing::error!(error);
    //                 panic!();
    //             },
    //         }
            
    //         let jvm_minecraft_parameters = BuildParameters::new(&value).get_jvm_minecraft_parameters();

    //         // let _ = process::build_minecraft_process(&jvm_minecraft_parameters, &value);

    //         let java_path = "/Library/Java/JavaVirtualMachines/jdk-17.0.1.jdk/Contents/Home/bin/java";
    //         // let java_path = "/Library/Java/JavaVirtualMachines/jdk1.8.0_311.jdk/Contents/Home/bin/java";

    //         let mut child = Command::new(java_path);
    //         child.args(&jvm_minecraft_parameters.parameters);
    //         child.current_dir(global_path::get_instances_dir_path().join("mckismetlab-main-server"));

    //         libraries::extract_natives(value.get_libraries(), &jvm_minecraft_parameters.natives_dir_path);
    //         let _ = children.rescue_cache().await;
    //         let _ = children.insert_new_process(Uuid::new_v4(), child).await;
    //     },
    //     Err(error) => { tracing::error!(error) }
    // }

    // tokio::time::sleep(tokio::time::Duration::from_secs(500)).await;

    Ok(())
}