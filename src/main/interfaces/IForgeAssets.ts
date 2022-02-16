import IForgeInstallProfile from "./IForgeInstallProfile";

export default interface IForgeAssets {
    isInstall: boolean;
    version: string;
    arguments: {
        game: Array<string>;
        jvm: Array<string>;
    } | string;
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
    versionJsonObject: any;
    installProfile?: IForgeInstallProfile;
}