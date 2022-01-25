import * as electron from "electron";
import * as os from "os";
import * as uuid from "uuid";
import * as path from "path";

import IoFile from "./core/io/IoFile";
import Java from "./core/java/Java";
import GameAssetsInstance from "./core/game/GameAssetsInstance";
import MicrosoftValidate from "./core/loginValidate/microsoft/MicrosoftValidate";
import MojangValidate from "./core/loginValidate/mojang/MojangValidate";
import MicrosoftAuthApi from "./api/MicrosoftAuthApi";
import Utils from "./core/utils/Utils";
import DiscordRPC from "./api/DiscordRPC";
import GlobalPath from "./core/io/GlobalPath";
import GameModule from "./core/utils/GameModule";

import { LAUNCHER_VERSION } from "./version";
import GameResourcePacks from "./core/utils/GameResourcePacks";
import GameScreenshot from "./core/utils/GameScreenshot";

const ioFile = new IoFile();
const java = new Java();

// init discord rpc
// DiscordRPC.initRpc();

const keysPressed = new Map();
window.addEventListener("keydown", (event) => {

    keysPressed.set(event.key, true);
    // open dev tools
    if (keysPressed.get("Control") && keysPressed.get("Shift") && keysPressed.get("P") && keysPressed.get("I") && keysPressed.get("B")) {

        electron.ipcRenderer.send("key", "openDevTools");
        console.log("%c等一下!請你停下你的動作!", "font-size: 52px; color: rgb(114, 137, 218); font-weight: 300;");
        console.log("%c如果有人叫你在這裡複製/貼上任何東西，你百分之百被騙了。", "font-size: 20px; color: rgb(255, 0, 0); font-weight: 600;");
        console.log("%c除非你完全明白你在做什麼，否則請關閉此視窗，保護你帳號的安全。", "font-size: 20px; color: rgb(255, 0, 0); font-weight: 600;");
    }
});
document.addEventListener("keyup", (event) => {
    keysPressed.delete(event.key);
});

electron.contextBridge.exposeInMainWorld("electron", {

    launcherVersion: LAUNCHER_VERSION,
    windowApi: {
        minimize: () => electron.ipcRenderer.send("windowApi", ["main", "minimize"]),
        maximize: () => electron.ipcRenderer.send("windowApi", ["main", "maximize"]),
        close: () => electron.ipcRenderer.send("windowApi", ["main", "close"])
    },

    clipboard: {
        writeImage(imagePath: string): void {
            const image = electron.nativeImage.createFromPath(imagePath);
            electron.clipboard.writeImage(image);
        }
    },

    open: {
        pathFolder: (path: string) => electron.shell.openPath(path)
    },

    path: {
        getGameMinecraftDirPath: (serverId: string) => path.join(GlobalPath.getInstancesDirPath(), serverId, ".minecraft"),
        getGameModsDirPath: (serverId: string) => path.join(GlobalPath.getInstancesDirPath(), serverId, ".minecraft", "mods"),
    },

    uuid: {
        getUUIDv4: () => uuid.v4()
    },

    auth: {
        async isValidateAccessToken(): Promise<boolean> {
            try {

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
                } else if (ioFile.getAuthType() === "mojang") {
                    if (ioFile.getAccessToken().length !== 0 && ioFile.getClientToken().length !== 0) {
                        if (await new MojangValidate(ioFile).mojangTokenValidate(ioFile.getAccessToken(), ioFile.getClientToken())) {
                            return true;
                        }
                    }
                }

                return false;
            } catch (error: any) {
                console.error(error);
                return false;
            }
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
        start: (serverId: string) => new GameAssetsInstance(serverId, ioFile).validateAssets(),
        window: {
            openLogWindow: () => electron.ipcRenderer.send("openGameLogWindow")
        },
        module: {
            getModules: (serverId: string) => new GameModule(serverId, ioFile).getModules(),
            moduleEnableDisable: (filePath: string, state: boolean) => GameModule.moduleEnableDisable(filePath, state),
            moduleDelete: (filePath: string) => GameModule.moduleDelete(filePath),
            copyModuleFile: (file: { name: string; path: string; }, serverId: string) => GameModule.copyModuleFile(file, serverId)
        },
        resourcePack: {
            getResourcePacksDirPath: (serverId: string) => path.join(GlobalPath.getInstancesDirPath(), serverId, ".minecraft", "resourcepacks"),
            getResourcePacks: (serverId: string) => GameResourcePacks.getResourcePacks(serverId),
            copyResourcePackFile: (file: { name: string; path: string; }, serverId: string) => GameResourcePacks.copyResourcePackFile(file, serverId),
            resourcePackDelete: (filePath: string) => GameResourcePacks.resourcePackDelete(filePath)
        },
        screenshot: {
            getScreenshots: (serverId: string) => GameScreenshot.getScreenshots(serverId),
            getScreenshotsDirPath: (serverId: string) => path.join(GlobalPath.getInstancesDirPath(), serverId, ".minecraft", "screenshots"),
            screenshotDelete: (filePath: string) => GameScreenshot.screenshotDelete(filePath)
        }
    },

    os: {
        ram: {
            getTotal: () => Math.round(os.totalmem() / 1024 / 1024 / 1024),
            getFree: () => Math.round(os.freemem() / 1024 / 1024 / 1024)
        },
        java: {
            getPath: () => java.searchLocalPath(),
            checkingPath: (path: string) => java.checkingJavaPath(path)
        },
        type: () => Utils.getOSType()
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
        },
        general: {
            getOpenGameKeepLauncherState: () => ioFile.getOpenGameKeepLauncherState(),
            setOpenGameKeepLauncherState: (state: boolean) => ioFile.setOpenGameKeepLauncherState(state),
            getGameStartOpenMonitorLog: () => ioFile.getGameStartOpenMonitorLog(),
            setGameStartOpenMonitorLog: (state: boolean) => ioFile.setGameStartOpenMonitorLog(state)
        }
    }
});
