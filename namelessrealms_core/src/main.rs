use namelessrealms_core::metadata;

fn main() {

    match metadata::get_minecraft_version_metadata("1.20.2") {
        Ok(value) => {
            match value.get_asset_objects() {
                Ok(v) => println!("{:#?}", v),
                Err(e) => panic!("{}", e)
            }
        },
        Err(error) => panic!("{}", error)
    }

}