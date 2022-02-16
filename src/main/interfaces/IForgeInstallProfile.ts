export default interface IForgeInstallProfile {
    data: {
        "": {
            client: string,
            server: string
        },
        [name: string]: {
            client: string;
            server: string;
        };
    };
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
    processors: Array<any>;
    clientLzmaPath: string;
}