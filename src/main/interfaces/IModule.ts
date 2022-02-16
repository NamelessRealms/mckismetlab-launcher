export default interface IModule {
  name: string;
  type: string;
  action: string;
  projectId: number;
  fileId: number;
  fileName: string;
  filePath: string;
  sha1: string;
  size: number;
  version: string;
  download: {
    url: string;
  }
}
