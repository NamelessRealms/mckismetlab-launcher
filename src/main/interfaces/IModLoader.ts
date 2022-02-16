import IForgeInstallProfile from "./IForgeInstallProfile";

export default interface IModLoader {
  modLoaderType: "Forge" | "Fabric";
  version: string;
  startArguments: {
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
    }>;
  }
  forge?: {
    isInstall: boolean;
    versionJsonObject: any;
    installProfile?: IForgeInstallProfile;
  };
  fabric?: {
    versionJsonObject: any;
  }
}
