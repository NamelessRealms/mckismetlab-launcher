export interface IModule {
    name: string;
    type: string;
    action: string;
    projectId: number;
    fileId: number;
    fileName: string;
    filePath: string;
    download: {
      url: string;
    }
  }
  