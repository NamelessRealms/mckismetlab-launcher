export default interface IFabricAssets {
    versionJsonObject: any;
    version: string;
    arguments: {
        game: Array<string>;
        jvm: Array<string>;
    },
    mainClass: string;
    libraries: Array<{
        name: string;
        download: {
            fileName: string;
            filePath: string;
            sha1: string;
            size: number;
            download: {
                url: string;
            }
        }
    }>
}