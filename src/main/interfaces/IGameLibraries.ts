export default interface IGameLibraries {
  libType: string;
  fileName: string;
  filePath: string;
  sha1: string;
  size: number;
  download: {
    url: string;
  }
}
