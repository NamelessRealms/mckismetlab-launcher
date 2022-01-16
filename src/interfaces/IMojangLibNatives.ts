export default interface IMojangLibNatives {
    linux: string;
    osx: string;
    windows: string;
    [system: string]: string;
}