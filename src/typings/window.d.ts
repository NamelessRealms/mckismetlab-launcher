declare interface Window {
    electron: electronApi
    gameLogElectron: gameLogElectronApi
}

interface gameLogElectronApi {
    windowApi: {
        minimize: () => void,
        maximize: () => void,
        close: () => void,
    },

    open: {
        pathFolder: (path: string) => void,
    },

    path: {
        getGameLogsDirPath: (serverId: string) => string,
    }

    event: {
        onGameLog: (callback: (data: { key: string, text: string }) => void) => void
    }
}

interface electronApi {

    launcherVersion: string,
    windowApi: {
        minimize: () => void,
        maximize: () => void,
        close: () => void,
    },

    clipboard: {
        writeImage: (imagePath: string) => void;
    },

    open: {
        pathFolder: (path: string) => void,
    }

    path: {
        getGameMinecraftDirPath: (serverId: string) => string,
        getGameModsDirPath: (serverId: string) => string,
    }

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
        windows: {
            openLogWindow: () => void
        },
        module: {
            getModules: (serverId: string) => Array<{ fileName: string; filePath: string; state: boolean;  hidden: boolean; }>;
            moduleEnableDisable: (filePath: string, state: boolean) => string;
            moduleDelete: (filePath: string) => void;
            copyModuleFile: (file: { name: string; path: string; }, serverId: string) => void;
        },
        resourcePack: {
            getResourcePacksDirPath: (serverId: string) => string;
            getResourcePacks: (serverId: string) => Array<{ fileName: string; filePath: string; imageSrc: string | undefined }>;
            copyResourcePackFile: (file: { name: string; path: string; }, serverId: string) => void;
            resourcePackDelete: (filePath: string) => void;
        },
        screenshot: {
            getScreenshots: (serverId: string) => Array<{ fileName: string; filePath: string; imageSrc: string | undefined }>;
            getScreenshotsDirPath: (serverId: string) => string;
            screenshotDelete: (filePath: string) => void;
        }
    }
    os: {
        ram: {
            getTotal: () => number;
            getFree: () => number;
        },
        java: {
            getPath: () => Promise<string>;
            checkingPath: (path: string) => Promise<boolean>;
        },
        type: () => "osx" | "windows" | "linux" | "unknown";
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
        },
        general: {
            getOpenGameKeepLauncherState: () => boolean;
            setOpenGameKeepLauncherState: (state: boolean) => void;
            getGameStartOpenMonitorLog: () => boolean;
            setGameStartOpenMonitorLog: (state: boolean) => void;
        }
    }

}