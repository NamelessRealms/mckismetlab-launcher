export default interface IAssetsObjectsReturn {
    objects: Array<{
      fileName: string;
      filePath: string;
      sha1: string;
      size: number;
      download: {
        url: string;
      }
    }>,
    jsonObjects: {
      data: {
        objects: {
          "": {
            hash: string;
            size: number;
          }
        }
      },
      filePath: string;
    }
  }
  