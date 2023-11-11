use std::{path::Path, fs::{File, self}, process::{Command, Stdio, Child}, thread, time::Duration};
use tracing::info;

use crate::{parameters::JavaStartParameters, libraries::{LibrariesJar, LibrariesJarType}, version_metadata::VersionMetadata, global_path};

pub fn build_start_process(java_start_parameters: &JavaStartParameters, version_metadata: &VersionMetadata) -> Result<Option<Child> , Box<dyn std::error::Error>> {
    
    copy_native_libraries(version_metadata.get_libraries(), &java_start_parameters.natives_dir_path)?;
    let game_path = global_path::get_instances_dir_path().join("mckismetlab-main-server");
    fs::create_dir_all(&game_path)?;

    println!("{:#?}", java_start_parameters.parameters);

    let java_path = "/Library/Java/JavaVirtualMachines/jdk-17.0.1.jdk/Contents/Home/bin/java";
    // let java_path = "/Library/Java/JavaVirtualMachines/jdk1.8.0_311.jdk/Contents/Home/bin/java";

    let mut child = Command::new(java_path)
        .args(&java_start_parameters.parameters)
        .current_dir(&game_path)
        .stdout(Stdio::inherit())
        .spawn()
        .expect("Failed to spawn child process.");

    // let mut stdin = child.stdout.take().expect("Failed to open stdout.");

    Ok(None)
}

fn copy_native_libraries(libraries: Vec<LibrariesJar>, natives_dir_path: &Path) -> Result<(), Box<dyn std::error::Error>> {

    fs::create_dir_all(natives_dir_path)?;
    let natives_libraries = libraries.iter().filter(|item| item.r#type == LibrariesJarType::Natives);

    for native_lib in natives_libraries {
        // println!("{}", native_lib.path.to_string_lossy().to_string());
        let zip_file = File::open(native_lib.path.to_path_buf())?;
        let mut archive = zip::ZipArchive::new(zip_file)?;
        archive.extract(natives_dir_path)?;

        // for i in 0..archive.len() {
        //     let mut file = archive.by_index(i).unwrap();
        //     println!("{}", file.name());
        //     let mut outpath = std::env::current_dir().unwrap();
        //     outpath.push(Path::new(natives_dir_path).join(file.name()));
        //     if (&*file.name()).ends_with('/') {
        //         std::fs::create_dir_all(outpath).unwrap();
        //     } else {
        //         let mut outfile = std::fs::File::create(outpath).unwrap();
        //         std::io::copy(&mut file, &mut outfile).unwrap();
        //     }
        // }
    }

    info!("Extraction natives completed: {}", natives_dir_path.to_string_lossy().to_string());

    Ok(())
}