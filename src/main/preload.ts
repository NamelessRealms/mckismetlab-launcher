import * as electron from "electron";
import * as os from "os";
import * as uuid from "uuid";
import * as path from "path";

import LauncherStore from "./core/io/LauncherStore";
import Java from "./core/java/Java";
import MicrosoftValidate from "./core/validate/microsoft/MicrosoftValidate";
import MojangValidate from "./core/validate/mojang/MojangValidate";
import Utils from "./core/utils/Utils";
import DiscordRPC from "./api/DiscordRPC";
import GlobalPath from "./core/io/GlobalPath";
import GameModule from "./core/utils/GameModule";

import { LAUNCHER_VERSION } from "./version";
import GameResourcePacks from "./core/utils/GameResourcePacks";
import GameScreenshot from "./core/utils/GameScreenshot";
import AssetsMain from "./core/game/AssetsMain";
import GameDataFlxMain from "./core/flx/gameDataFlx/GameDataFlxMain";
import { ProcessStop } from "./core/utils/ProcessStop";
import LoggerUtil from "./core/utils/LoggerUtil";
import { GameFlxStateEnum } from "./enums/GameFlxStateEnum";
import { GameInstanceStateEnum } from "./enums/GameInstanceStateEnum";

const ioFile = new LauncherStore();
const java = new Java()
const logger = new LoggerUtil("Preload");

// init main
init();

function init() {

    logger.info("初始化啟動器...");

    // init autoUpdate
    // o windows
    // x macos
    // x linux
    if (Utils.getOSType() === "windows") autoUpdate();

    // init keydown
    initKeyDown();

    // init discord rpc
    // DiscordRPC.initRpc();

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

                        const accessToken = await ioFile.getMicrosoftAccessToken();
                        const refreshToken = await ioFile.getMicrosoftRefreshToken();

                        if (accessToken === null || refreshToken === null) {
                            return false;
                        }

                        if (accessToken.length !== 0 && refreshToken.length !== 0) {
                            return await new MicrosoftValidate(ioFile).validateMicrosoft();
                        }

                    } else if (ioFile.getAuthType() === "mojang") {
                        if (ioFile.getMinecraftAccessToken().length !== 0 && ioFile.getMinecraftClientToken().length !== 0) {
                            if (await new MojangValidate(ioFile).mojangTokenValidate(ioFile.getMinecraftAccessToken(), ioFile.getMinecraftClientToken())) {
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
            },
            signOut(): void {
                if (ioFile.getAuthType() === "microsoft") {
                    electron.ipcRenderer.send("openMSALogoutWindow");
                    electron.ipcRenderer.on("MSALogoutWindowReply", (event, ...args) => {
                        new MicrosoftValidate(ioFile).signOut();
                    });
                } else {
                    new MojangValidate(ioFile).signOut();
                }
            }
        },

        game: {
            instance: {
                start: (serverId: string, userType: "React" | "User", callback: (code: number) => void) => {

                    let gameInstance = AssetsMain.getGameInstance(serverId, ioFile);
                    let state = gameInstance.getGameInstanceState();

                    if (state === "close" || state === "closeError" || state === "completeStop") {
                        ProcessStop.deleteProcessMap(serverId);
                        AssetsMain.deleteGameInstance(serverId);
                        gameInstance = AssetsMain.getGameInstance(serverId, ioFile);
                        state = gameInstance.getGameInstanceState();
                    }

                    if (state === "onStandby" && userType === "User") {
                        gameInstance.validateAssets(false);
                    }

                    if(state === "validate" && userType === "User") {
                        ProcessStop.setProcessStop(serverId, false);
                        AssetsMain.getGameInstance(serverId, ioFile).setGameInstanceState(GameInstanceStateEnum.stop)
                    }

                    const event = gameInstance.getEvents();
                    event.removeAllListeners("gameCode");
                    event.on("gameCode", callback);

                    return gameInstance.getGameInstanceState();
                },
                getState: (serverId: string) => AssetsMain.getGameInstance(serverId, ioFile).getGameInstanceState(),
                progress: {
                    progressManagerEvent(serverId: string, callback: (progressBarChange: { bigPercentage: number, percentage: number, progressBarText: string }) => void) {
                        const instance = AssetsMain.getGameInstance(serverId, ioFile);
                        instance.getProgressManager().event().removeAllListeners("progressBarChange");
                        instance.getProgressManager().event().on("progressBarChange", callback);
                    },
                    getPercentageData: (serverId: string) => AssetsMain.getGameInstance(serverId, ioFile).getProgressManager().getPercentageData()
                },
                delete: (serverId: string) => AssetsMain.deleteGameInstance(serverId),
                flx: {
                    start: (serverId: string, userType: "settingPage" | "mainPage", callback: (code: number) => void, flxType?: "simple" | "deep") => {

                        let gameFlxDataInstance = GameDataFlxMain.getGameDataFlxInstance(serverId, ioFile);
                        let state = gameFlxDataInstance.getGameFlxState();

                        if(state === "complete" || state === "error" || state === "completeStop") {
                            ProcessStop.deleteProcessMap(serverId);
                            GameDataFlxMain.deleteGameDataFlx(serverId);
                            gameFlxDataInstance = GameDataFlxMain.getGameDataFlxInstance(serverId, ioFile);
                            state = gameFlxDataInstance.getGameFlxState();
                        }

                        if(state === "onStandby" && userType === "settingPage") {
                            if(flxType === undefined) throw new Error("flxType not null.")
                            gameFlxDataInstance.validateFlx(flxType);
                        }

                        const event = gameFlxDataInstance.getEvents();
                        event.removeAllListeners("gameCode");
                        event.on("gameCode", callback);
    
                        return gameFlxDataInstance.getGameFlxState();
                    },
                    getGameFlxFlxType: (serverId: string) => GameDataFlxMain.getGameDataFlxInstance(serverId, ioFile).getFlxType(),
                    getGameFlxState: (serverId: string) => GameDataFlxMain.getGameDataFlxInstance(serverId, ioFile).getGameFlxState(),
                    progress: {
                        progressManagerEvent(serverId: string, callback: (progressBarChange: { bigPercentage: number, percentage: number, progressBarText: string }) => void) {
                            const instance = GameDataFlxMain.getGameDataFlxInstance(serverId, ioFile);
                            instance.getProgressManager().event().removeAllListeners("progressBarChange");
                            instance.getProgressManager().event().on("progressBarChange", callback);
                        },
                        getPercentageData: (serverId: string) => GameDataFlxMain.getGameDataFlxInstance(serverId, ioFile).getProgressManager().getPercentageData()
                    },
                    delete: (serverId: string) => {GameDataFlxMain.deleteGameDataFlx(serverId); ProcessStop.deleteProcessMap(serverId);},
                    stop: (serverId: string) => {
                        ProcessStop.setProcessStop(serverId, false);
                        GameDataFlxMain.getGameDataFlxInstance(serverId, ioFile).setGameFlxState(GameFlxStateEnum.stop);
                    },
                    getProcessStopState: (serverId: string) => ProcessStop.getProcessStop(serverId)
                }
            },
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
            },
            player: {
                getPlayerName: () => ioFile.getPlayerName()
            }
        }
    });
}

function initKeyDown() {
    const keysPressed = new Map();
    window.addEventListener("keydown", (event) => {

        keysPressed.set(event.key, true);
        // open dev tools
        if (keysPressed.get("Control") && keysPressed.get("Shift") && keysPressed.get("P") && keysPressed.get("I") && keysPressed.get("B")) {

            electron.ipcRenderer.send("key", "openDevTools");
            console.log("等一下!請你停下你的動作!", "font-size: 52px; color: rgb(114, 137, 218); font-weight: 300;");
            console.log("如果有人叫你在這裡複製/貼上任何東西，你百分之百被騙了。", "font-size: 20px; color: rgb(255, 0, 0); font-weight: 600;");
            console.log("除非你完全明白你在做什麼，否則請關閉此視窗，保護你帳號的安全。", "font-size: 20px; color: rgb(255, 0, 0); font-weight: 600;");
        }
    });
    document.addEventListener("keyup", (event) => {
        keysPressed.delete(event.key);
    });
}

function autoUpdate() {

    logger.info("檢查更新...");

    electron.ipcRenderer.send("autoUpdateAction", "initAutoUpdater");
    electron.ipcRenderer.on("autoUpdateNotification", (event, args) => {

        switch (args[0]) {
            case "firstrun":

                logger.info("首次啟動啟動器！ 跳過更新處理，以免發生問題。");

                break;
            case "ready":

                electron.ipcRenderer.send("autoUpdateAction", "updateAvailable");

                break;
            case "update_available":

                logger.info("有新更新，下載更新中...");

                break;
            case "update_downloaded":

                logger.info("已完成下載更新！");

                break;
            case "update_not_available":

                logger.info("沒有可用更新！");

                break;
            case "realerror":

                logger.error(args[1]);

                break;
        }

    });
}