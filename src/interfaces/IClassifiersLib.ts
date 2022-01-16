export default interface IClassifiersLib {
    "natives-linux": {
        path: string,
        sha1: string,
        size: number,
        url: string
    },
    "natives-osx": {
        path: string,
        sha1: string,
        size: number,
        url: string
    },
    "natives-windows": {
        path: string,
        sha1: string,
        size: number,
        url: string
    },
    [system: string]: {
        path: string,
        sha1: string,
        size: number,
        url: string
    }
}