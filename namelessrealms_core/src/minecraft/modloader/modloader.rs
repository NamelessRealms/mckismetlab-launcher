pub struct BuildModLoaderParameters<'a> {
    modloader_version: &'a str,
    minecraft_version: &'a str,
}

impl<'a> BuildModLoaderParameters<'a> {
    
    pub fn new(modloader_version: &'a str, minecraft_version: &'a str) -> Self {
        BuildModLoaderParameters {
            modloader_version,
            minecraft_version
        }
    }
}