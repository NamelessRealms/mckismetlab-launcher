use namelessrealms_core::{metadata, parameters::BuildParameters, download, process, logger};

fn main() {

    let _logger_guard = logger::init_logger();

    match metadata::get_minecraft_version_metadata("1.20.2") {
        Ok(value) => {

            download::validate_installer(&value);
            let java_start_parameters = BuildParameters::new(&value).get_java_start_parameters();
            // let _child = process::build_start_process(&java_start_parameters, &value);
        },
        Err(error) => { tracing::error!(error) }
    }

}