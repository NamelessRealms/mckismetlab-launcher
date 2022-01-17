declare interface Window {
    electron: electronApi
}

interface electronApi {
    windowApi: {
        minimize: () => void,
        maximize: () => void,
        close: () => void,
    },
    uuid: {
        getUUIDv4: () => string,
    },

    auth: {
        isValidateAccessToken: () => Promise<boolean>,
        microsoftLogin: {
            openLoginWindow: (loginKeepToggle: boolean, callback: (code: number) => void) => void,
        },
        mojangLogin: {
            login: (email: string, password: string, loginKeepToggle: boolean, callback: (code: number) => void) => void
        }
    }
    game: {
        start: (serverId: string) => void,
    }
    os: {
        ram: {
            getTotal: () => number;
            getFree: () => number;
        },
        java: {
            getPath: () => Promise<string>;
            checkingPath: (path: string) => Promise<boolean>;
        }
    },
    io: {
        save: () => void,
        mainDisplayPosition: {
            get: () => number;
            set: (displayPosition: number) => void;
        },
        java: {
            ram: {
                getMaxSize: (serverName: string) => number,
                getMinSize: (serverName: string) => number,
                setMaxSize: (serverName: string, size: number) => void,
                setMinSize: (serverName: string, size: number) => void,
                getChecked: (serverName: string) => boolean,
                setChecked: (serverName: string, checked: boolean) => void;
            },
            parameter: {
                get: (serverName: string) => string,
                set: (serverName: string, parameter: string) => void,
                getChecked: (serverName: string) => boolean,
                setChecked: (serverName: string, checked: boolean) => void
            },
            path: {
                get: (serverName: string) => string,
                set: (serverName: string, path: string) => void,
                getChecked: (serverName: string) => boolean;
                setChecked: (serverName: string, checked: boolean) => void;
                getIsBuiltInJavaVM: (serverName: string) => boolean;
                setIsBuiltInJavaVM: (serverName: string, state: boolean) => void;
            }
        }
    }

}