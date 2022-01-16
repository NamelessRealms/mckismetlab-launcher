export interface IModLoaders {
  isInstall: boolean;
  modLoadersType: "forge";
  forgeVersion: string;
  versionJsonObject: any;
  installProfile?: {
    data: {
      "": {
        client: string,
        server: string
      },
      [name: string]: {
        client: string;
        server: string;
      };
    },
    libraries: Array<{
      name: string,
      downloads: {
        artifact: {
          path: string,
          url: string,
          sha1: string,
          size: number
        }
      }
    }>
    processors: Array<any>,
    clientLzmaPath: string;
  }
}
