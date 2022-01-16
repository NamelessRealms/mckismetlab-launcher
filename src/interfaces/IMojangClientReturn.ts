export default interface IMojangClientReturn {
    fileName: string;
    filePath: string;
    sha1: string;
    size: number;
    download: {
        url: string;
    }
}