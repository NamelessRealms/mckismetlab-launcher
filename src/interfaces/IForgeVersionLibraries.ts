export default interface IForgeVersionLibraries {

    name: string;
    downloads: {
        artifact: {
            path: string;
            url: string;
            sha1: string;
            size: number;
        }
    }
}