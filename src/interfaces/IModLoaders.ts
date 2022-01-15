export interface IModLoaders {
    type: string;
    modLoadersType: string;
    minecraftVersion: string;
    forge: {
      forgeVersion: string,
      installProfile: {
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
      },
      versionJson: any
    }
  }
  