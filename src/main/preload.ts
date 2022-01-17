import * as electron from "electron";
import * as os from "os";
import * as uuid from "uuid";
import IoFile from "./io/IoFile";
import Java from "./java/Java";
import GameAssetsInstance from "./game/GameAssetsInstance";
import MicrosoftValidate from "./loginValidate/microsoft/MicrosoftValidate";
import MojangValidate from "./loginValidate/mojang/MojangValidate";
import MicrosoftAuthApi from "./api/MicrosoftAuthApi";

const ioFile = new IoFile();
const java = new Java();

electron.contextBridge.exposeInMainWorld("electron", {

    windowApi: {
        minimize: () => electron.ipcRenderer.send("windowApi", "minimize"),
        maximize: () => electron.ipcRenderer.send("windowApi", "maximize"),
        close: () => electron.ipcRenderer.send("windowApi", "close")
    },

    uuid: {
        getUUIDv4: () => uuid.v4()
    },

    auth: {
        async isValidateAccessToken(): Promise<boolean> {

            if (ioFile.getAuthType() === "microsoft") {
                if (ioFile.getMicrosoftAccessToken().length !== 0 && ioFile.getMicrosoftRefreshToken().length !== 0) {
                    
                    const microsoftValidate = new MicrosoftValidate(ioFile);

                    if (await microsoftValidate.validateMicrosoft()) {

                        if (ioFile.getMicrosoftAccessToken().length !== 0) {
                            const MCAccessToken = await new MicrosoftAuthApi().authMinecraft(ioFile.getMicrosoftAccessToken());
                            MicrosoftValidate.MCAccessToken = MCAccessToken.access_token;
                        }

                        return true;
                    }
                }
            } else if(ioFile.getAuthType() === "mojang") {
                if (ioFile.getAccessToken().length !== 0 && ioFile.getClientToken().length !== 0) {
                    if (await new MojangValidate(ioFile).mojangTokenValidate(ioFile.getAccessToken(), ioFile.getClientToken())) {
                        return true;
                    }
                }
            }

            return false;
        },
        microsoftLogin: {
            openLoginWindow(loginKeepToggle: boolean, callback: (code: number) => void) {

                electron.ipcRenderer.send("openMSALoginWindow", "open");
                electron.ipcRenderer.on("MSALoginWindowReply", (event, ...args) => {

                    if (args[0] === "error") {
                        console.warn("無法開啟登入視窗");
                        callback(1);
                        return;
                    }

                    const queryMap = args[0];
                    if (queryMap.has("error")) {

                        let error = queryMap.get("error");
                        let errorDescription = queryMap.get("error_description");

                        if (error === "access_denied") {
                            errorDescription = "To use the NexusLauncher, you must agree to the required permissions! Otherwise you can\'t use this launcher with Microsoft accounts.<br><br>Despite agreeing to the permissions you don\'t give us the possibility to do anything with your account, because all data will always be sent back to you (the launcher) IMMEDIATELY and WITHOUT WAY.";
                        }

                        console.warn(errorDescription);
                        callback(1);
                        return;
                    }

                    new MicrosoftValidate(ioFile).microsoftLogin(queryMap.get("code"), loginKeepToggle)
                        .then(() => {
                            callback(0);
                        })
                        .catch((error: any) => {
                            console.error(error);
                            callback(1);
                        });
                });
            }
        },
        mojangLogin: {
            login: (email: string, password: string, loginKeepToggle: boolean, callback: (code: number) => void) => {
                new MojangValidate(ioFile).mojangLogin(email, password, loginKeepToggle)
                    .then(() => {
                        callback(0);
                    })
                    .catch((error: any) => {
                        console.error(error);
                        callback(1);
                    });
            }
        }
    },

    game: {
        start: (serverId: string) => new GameAssetsInstance(serverId, ioFile).validateAssets()
    },

    os: {
        ram: {
            getTotal: () => Math.round(os.totalmem() / 1024 / 1024 / 1024),
            getFree: () => Math.round(os.freemem() / 1024 / 1024 / 1024)
        },
        java: {
            getPath: () => java.searchLocalPath(),
            checkingPath: (path: string) => java.checkingJavaPath(path)
        }
    },

    io: {
        save() {
            ioFile.save();
        },
        mainDisplayPosition: {
            get: () => ioFile.getDisplayPosition(),
            set(displayPosition: number): void {
                if (displayPosition === undefined) throw new Error("displayPosition not null.");
                ioFile.setDisplayPosition(displayPosition);
            }
        },
        java: {
            ram: {
                getMaxSize: (serverName: string) => ioFile.getRamSizeMax(serverName),
                setMaxSize(serverName: string, size: number) {
                    if (size === undefined) throw new Error("size not null.");
                    if (serverName === undefined) throw new Error("serverName not null.");
                    ioFile.setRamSizeMax(serverName, size);
                },
                getMinSize: (serverName: string) => ioFile.getRamSizeMin(serverName),
                setMinSize(serverName: string, size: number) {
                    if (size === undefined) throw new Error("size not null.");
                    if (serverName === undefined) throw new Error("serverName not null.");
                    ioFile.setRamSizeMin(serverName, size);
                },
                getChecked: (serverName: string) => ioFile.getRamChecked(serverName),
                setChecked(serverName: string, checked: boolean) {
                    if (checked === undefined) throw new Error("checked not null.");
                    if (serverName === undefined) throw new Error("serverName not null.");
                    ioFile.setRamChecked(serverName, checked);
                }
            },
            parameter: {
                get: (serverName: string) => ioFile.getJavaParameter(serverName),
                set(serverName: string, parameter: string) {
                    if (parameter === undefined) throw new Error("parameter not null.");
                    ioFile.setJavaParameter(serverName, parameter);
                },
                getChecked: (serverName: string) => ioFile.getJavaParameterChecked(serverName),
                setChecked(serverName: string, checked: boolean) {
                    if (checked === undefined) throw new Error("checked not null.");
                    if (serverName === undefined) throw new Error("serverName not null.");
                    ioFile.setJavaParameterChecked(serverName, checked);
                }
            },
            path: {
                get: (serverName: string) => ioFile.getJavaPath(serverName),
                set(serverName: string, path: string) {
                    if (path === undefined) throw new Error("path not null.");
                    if (serverName === undefined) throw new Error("serverName not null.");
                    ioFile.setJavaPath(serverName, path);
                },
                getChecked: (serverName: string) => ioFile.getJavaPathChecked(serverName),
                setChecked(serverName: string, checked: boolean) {
                    if (checked === undefined) throw new Error("checked not null.");
                    if (serverName === undefined) throw new Error("serverName not null.");
                    ioFile.setJavaPathChecked(serverName, checked);
                },
                getIsBuiltInJavaVM: (serverName: string) => ioFile.getIsBuiltInJavaVM(serverName),
                setIsBuiltInJavaVM(serverName: string, state: boolean): void {
                    if (state === undefined) throw new Error("state not null.");
                    if (serverName === undefined) throw new Error("serverName not null.");
                    ioFile.setIsBuiltInJavaVM(serverName, state);
                }
            }
        }
    }
});
