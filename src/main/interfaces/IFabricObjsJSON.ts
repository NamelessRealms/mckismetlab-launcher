export default interface IFabricObjsJSON {
    id: string;
    inheritsFrom: string;
    releaseTime: string;
    time: string;
    type: string;
    mainClass: string;
    arguments: {
        game: Array<string>;
        jvm: Array<string>;
    };
    libraries: Array<{
        name: string;
        url: string;
    }>;
}