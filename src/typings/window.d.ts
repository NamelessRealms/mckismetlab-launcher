declare interface Window {
    electron: electron
}

interface electron {
    windowApi: {
        minimize: () => void,
        maximize: () => void,
        close: () => void,
    },
    uuid: {
        getUUIDv4: () => string,
    },
    io: {
        getRamSizeMax: () => Map<any, any>,
    }

}