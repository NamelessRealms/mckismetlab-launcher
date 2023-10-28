"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const electron = require("electron");
const os = require("os");
const uuid = require("uuid");
const path = require("path");
const fs = require("fs-extra");
const LauncherStore_1 = require("./core/io/LauncherStore");
const Java_1 = require("./core/java/Java");
const MicrosoftValidate_1 = require("./core/validate/microsoft/MicrosoftValidate");
const MojangValidate_1 = require("./core/validate/mojang/MojangValidate");
const Utils_1 = require("./core/utils/Utils");
const DiscordRPC_1 = require("./api/DiscordRPC");
const GlobalPath_1 = require("./core/io/GlobalPath");
const GameModule_1 = require("./core/utils/GameModule");
const version_1 = require("./version");
const GameResourcePacks_1 = require("./core/utils/GameResourcePacks");
const GameScreenshot_1 = require("./core/utils/GameScreenshot");
const AssetsMain_1 = require("./core/game/AssetsMain");
const GameDataFlxMain_1 = require("./core/flx/gameDataFlx/GameDataFlxMain");
const ProcessStop_1 = require("./core/utils/ProcessStop");
const LoggerUtil_1 = require("./core/utils/LoggerUtil");
const GameFlxStateEnum_1 = require("./enums/GameFlxStateEnum");
const GameInstanceStateEnum_1 = require("./enums/GameInstanceStateEnum");
const CommonPreload_1 = require("./CommonPreload");
const Embed_1 = require("./core/utils/discord/Embed");
const Dates_1 = require("./core/utils/Dates");
const Webhooks_1 = require("./core/utils/Webhooks");
const isDev = process.env.NODE_ENV === "development";
const launcherStore = new LauncherStore_1.default();
const java = new Java_1.default();
const logger = new LoggerUtil_1.default("Preload");
// init main
init();
function init() {
    logger.info("初始化啟動器...");
    // init autoUpdate
    // o windows
    // x macos
    // x linux
    if (Utils_1.default.getOSType() === "windows")
        autoUpdate();
    // init keydown
    initKeyDown();
    // init discord rpc
    if (!isDev)
        DiscordRPC_1.default.initRpc();
    // init common preload
    new CommonPreload_1.default(electron, launcherStore).init();
    // init ipc
    electron.ipcRenderer.on("io", (event, args) => {
        if (args[0] === "save")
            launcherStore.save();
    });
    electron.contextBridge.exposeInMainWorld("electron", {
        launcherVersion: version_1.LAUNCHER_VERSION,
        send: {
            error(message, errorType, serverId) {
                const errorId = uuid.v4().split("-")[0];
                const embed = new Embed_1.default();
                embed.authorName = launcherStore.getPlayerName();
                embed.authorIconUrl = `https://crafatar.com/renders/head/${launcherStore.getPlayerUuid()}?scale=3&overlay`;
                embed.footerText = `提交時間 ${Dates_1.default.fullYearTime()}`;
                embed.color = "15158332";
                embed.setFields({
                    name: "問題ID:",
                    value: errorId
                });
                embed.setFields({
                    name: "啟動器版本:",
                    value: version_1.LAUNCHER_VERSION
                });
                embed.setFields({
                    name: "作業系統:",
                    value: Utils_1.default.getOSType()
                });
                embed.setFields({
                    name: "錯誤類型:",
                    value: errorType
                });
                embed.description = `問題描述: ${message.length > 0 ? message : "沒有說明"}`;
                const filePaths = new Array();
                // launcher
                const launcherLogDirPath = path.join(GlobalPath_1.default.getCommonDirPath(), "logs");
                const launcherLatestLogFilePath = path.join(launcherLogDirPath, "latest.log");
                const launcherErrorLogFilePath = path.join(launcherLogDirPath, "error.log");
                // push launcher latest.log
                if (fs.existsSync(launcherLatestLogFilePath))
                    filePaths.push(launcherLatestLogFilePath);
                // push launcher error.log
                if (fs.existsSync(launcherErrorLogFilePath))
                    filePaths.push(launcherErrorLogFilePath);
                if (errorType === "Minecraft") {
                    if (serverId === undefined)
                        throw new Error("serverId not null.");
                    // minecraft
                    const minecraftGameDirPath = path.join(GlobalPath_1.default.getInstancesDirPath(), serverId, ".minecraft");
                    const minecraftLogDirPath = path.join(minecraftGameDirPath, "logs");
                    const minecraftLatestLogFilePath = path.join(minecraftLogDirPath, "latest.log");
                    const minecraftCrashDirPath = path.join(minecraftGameDirPath, "crash-reports");
                    const getLatestCrashTxtFilePath = () => {
                        if (fs.existsSync(minecraftCrashDirPath)) {
                            const readdirs = fs.readdirSync(minecraftCrashDirPath);
                            const crashDirFileNames = new Array();
                            for (let readdir of readdirs) {
                                if (readdir.split("-")[0] === "crash") {
                                    crashDirFileNames.push(readdir);
                                }
                            }
                            if (crashDirFileNames.length !== 0) {
                                return path.join(minecraftCrashDirPath, crashDirFileNames.pop());
                            }
                        }
                        return null;
                    };
                    // push minecraft crash-report.txt
                    const minecraftLatestCrashTxtFilePath = getLatestCrashTxtFilePath();
                    if (minecraftLatestCrashTxtFilePath !== null)
                        filePaths.push(minecraftLatestCrashTxtFilePath);
                    // push minecraft latest.log
                    if (fs.existsSync(minecraftLatestLogFilePath))
                        filePaths.push(minecraftLatestLogFilePath);
                }
                // send error -> discord error channel
                new Webhooks_1.default().sendDiscordWebhookEmbedsFile(embed, errorId, filePaths);
            }
        },
        windowApi: {
            minimize: () => electron.ipcRenderer.send("windowApi", ["main", "minimize"]),
            maximize: () => electron.ipcRenderer.send("windowApi", ["main", "maximize"]),
            close: () => electron.ipcRenderer.send("windowApi", ["main", "close"])
        },
        clipboard: {
            writeImage(imagePath) {
                const image = electron.nativeImage.createFromPath(imagePath);
                electron.clipboard.writeImage(image);
            }
        },
        open: {
            pathFolder: (path) => electron.shell.openPath(path)
        },
        path: {
            getGameMinecraftDirPath: (serverId) => path.join(GlobalPath_1.default.getInstancesDirPath(), serverId, ".minecraft"),
            getGameModsDirPath: (serverId) => path.join(GlobalPath_1.default.getInstancesDirPath(), serverId, ".minecraft", "mods"),
        },
        uuid: {
            getUUIDv4: () => uuid.v4()
        },
        auth: {
            isValidateAccessToken() {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    try {
                        if (launcherStore.getAuthType() === "microsoft") {
                            const accessToken = yield launcherStore.getMicrosoftAccessToken();
                            const refreshToken = yield launcherStore.getMicrosoftRefreshToken();
                            if (accessToken === null || refreshToken === null) {
                                return false;
                            }
                            if (accessToken.length !== 0 && refreshToken.length !== 0) {
                                return yield new MicrosoftValidate_1.default(launcherStore).validateMicrosoft();
                            }
                        }
                        else if (launcherStore.getAuthType() === "mojang") {
                            if (launcherStore.getMinecraftAccessToken().length !== 0 && launcherStore.getMinecraftClientToken().length !== 0) {
                                if (yield new MojangValidate_1.default(launcherStore).mojangTokenValidate(launcherStore.getMinecraftAccessToken(), launcherStore.getMinecraftClientToken())) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    }
                    catch (error) {
                        console.error(error);
                        return false;
                    }
                });
            },
            microsoftLogin: {
                openLoginWindow(loginKeepToggle, callback) {
                    electron.ipcRenderer.send("openMSALoginWindow", "open");
                    electron.ipcRenderer.on("MSALoginWindowNotification", (event, ...args) => {
                        if (args[0] === "error") {
                            logger.warn("無法開啟MSA登入視窗");
                            callback(1);
                            return;
                        }
                        if (args[0] === "close") {
                            callback(2);
                            return;
                        }
                        const queryMap = args[0];
                        if (queryMap.has("error")) {
                            let error = queryMap.get("error");
                            let errorDescription = queryMap.get("error_description");
                            if (error === "access_denied") {
                                errorDescription = "To use the NexusLauncher, you must agree to the required permissions! Otherwise you can\'t use this launcher with Microsoft accounts.<br><br>Despite agreeing to the permissions you don\'t give us the possibility to do anything with your account, because all data will always be sent back to you (the launcher) IMMEDIATELY and WITHOUT WAY.";
                            }
                            logger.warn(errorDescription);
                            callback(1);
                            return;
                        }
                        new MicrosoftValidate_1.default(launcherStore).microsoftLogin(queryMap.get("code"), loginKeepToggle)
                            .then(() => {
                            callback(0);
                        })
                            .catch((error) => {
                            logger.error(error);
                            callback(1);
                        });
                    });
                }
            },
            mojangLogin: {
                login: (email, password, loginKeepToggle, callback) => {
                    new MojangValidate_1.default(launcherStore).mojangLogin(email, password, loginKeepToggle)
                        .then(() => {
                        callback(0);
                    })
                        .catch((error) => {
                        console.error(error);
                        callback(1);
                    });
                }
            },
            signOut(callback) {
                if (launcherStore.getAuthType() === "microsoft") {
                    electron.ipcRenderer.send("openMSALogoutWindow");
                    electron.ipcRenderer.on("MSALogoutWindowNotification", (event, ...args) => {
                        if (args[0] === "error") {
                            logger.warn("無法開啟MSA登出視窗");
                            callback(1);
                            return;
                        }
                        if (args[0] === "close") {
                            callback(2);
                            return;
                        }
                        if (args[0] === "session") {
                            callback(0);
                            new MicrosoftValidate_1.default(launcherStore).signOut();
                        }
                    });
                }
                else {
                    new MojangValidate_1.default(launcherStore).signOut();
                }
            }
        },
        game: {
            instance: {
                start: (serverId, userType, callback) => {
                    let gameInstance = AssetsMain_1.default.getGameInstance(serverId, launcherStore);
                    let state = gameInstance.getGameInstanceState();
                    if (state === "close" || state === "closeError" || state === "startError" || state === "completeStop") {
                        ProcessStop_1.ProcessStop.deleteProcessMap(serverId);
                        AssetsMain_1.default.deleteGameInstance(serverId);
                        gameInstance = AssetsMain_1.default.getGameInstance(serverId, launcherStore);
                        state = gameInstance.getGameInstanceState();
                    }
                    const event = gameInstance.getEvents();
                    event.removeAllListeners("gameCode");
                    event.on("gameCode", (args) => callback(args[0], args[1]));
                    // start
                    if (state === "onStandby" && userType === "User") {
                        gameInstance.validateAssets(false);
                    }
                    if (state === "validate" && userType === "User") {
                        ProcessStop_1.ProcessStop.setProcessStop(serverId, false);
                        AssetsMain_1.default.getGameInstance(serverId, launcherStore).setGameInstanceState(GameInstanceStateEnum_1.GameInstanceStateEnum.stop);
                    }
                    return gameInstance.getGameInstanceState();
                },
                getState: (serverId) => AssetsMain_1.default.getGameInstance(serverId, launcherStore).getGameInstanceState(),
                progress: {
                    progressManagerEvent(serverId, callback) {
                        const instance = AssetsMain_1.default.getGameInstance(serverId, launcherStore);
                        instance.getProgressManager().event().removeAllListeners("progressBarChange");
                        instance.getProgressManager().event().on("progressBarChange", callback);
                    },
                    getPercentageData: (serverId) => AssetsMain_1.default.getGameInstance(serverId, launcherStore).getProgressManager().getPercentageData()
                },
                delete: (serverId) => AssetsMain_1.default.deleteGameInstance(serverId),
                flx: {
                    start: (serverId, userType, callback, flxType) => {
                        let gameFlxDataInstance = GameDataFlxMain_1.default.getGameDataFlxInstance(serverId, launcherStore);
                        let state = gameFlxDataInstance.getGameFlxState();
                        if (state === "complete" || state === "error" || state === "completeStop") {
                            ProcessStop_1.ProcessStop.deleteProcessMap(serverId);
                            GameDataFlxMain_1.default.deleteGameDataFlx(serverId);
                            gameFlxDataInstance = GameDataFlxMain_1.default.getGameDataFlxInstance(serverId, launcherStore);
                            state = gameFlxDataInstance.getGameFlxState();
                        }
                        const event = gameFlxDataInstance.getEvents();
                        event.removeAllListeners("gameCode");
                        event.on("gameCode", (args) => callback(args[0], args[1]));
                        // start
                        if (state === "onStandby" && userType === "settingPage") {
                            if (flxType === undefined)
                                throw new Error("flxType not null.");
                            gameFlxDataInstance.validateFlx(flxType);
                        }
                        return gameFlxDataInstance.getGameFlxState();
                    },
                    getGameFlxFlxType: (serverId) => GameDataFlxMain_1.default.getGameDataFlxInstance(serverId, launcherStore).getFlxType(),
                    getGameFlxState: (serverId) => GameDataFlxMain_1.default.getGameDataFlxInstance(serverId, launcherStore).getGameFlxState(),
                    progress: {
                        progressManagerEvent(serverId, callback) {
                            const instance = GameDataFlxMain_1.default.getGameDataFlxInstance(serverId, launcherStore);
                            instance.getProgressManager().event().removeAllListeners("progressBarChange");
                            instance.getProgressManager().event().on("progressBarChange", callback);
                        },
                        getPercentageData: (serverId) => GameDataFlxMain_1.default.getGameDataFlxInstance(serverId, launcherStore).getProgressManager().getPercentageData()
                    },
                    delete: (serverId) => { GameDataFlxMain_1.default.deleteGameDataFlx(serverId); ProcessStop_1.ProcessStop.deleteProcessMap(serverId); },
                    stop: (serverId) => {
                        ProcessStop_1.ProcessStop.setProcessStop(serverId, false);
                        GameDataFlxMain_1.default.getGameDataFlxInstance(serverId, launcherStore).setGameFlxState(GameFlxStateEnum_1.GameFlxStateEnum.stop);
                    },
                    getProcessStopState: (serverId) => ProcessStop_1.ProcessStop.getProcessStop(serverId)
                }
            },
            window: {
                openLogWindow: () => electron.ipcRenderer.send("openGameLogWindow")
            },
            module: {
                getModules: (serverId) => new GameModule_1.default(serverId, launcherStore).getModules(),
                moduleEnableDisable: (filePath, state, serverId) => {
                    const newFilePath = GameModule_1.default.moduleEnableDisable(filePath, state);
                    GameModule_1.default.addModuleRevise(filePath, serverId);
                    return newFilePath;
                },
                moduleDelete: (filePath) => GameModule_1.default.moduleDelete(filePath),
                copyModuleFile: (file, serverId) => GameModule_1.default.copyModuleFile(file, serverId)
            },
            resourcePack: {
                getResourcePacksDirPath: (serverId) => path.join(GlobalPath_1.default.getInstancesDirPath(), serverId, ".minecraft", "resourcepacks"),
                getResourcePacks: (serverId) => GameResourcePacks_1.default.getResourcePacks(serverId),
                copyResourcePackFile: (file, serverId) => GameResourcePacks_1.default.copyResourcePackFile(file, serverId),
                resourcePackDelete: (filePath) => GameResourcePacks_1.default.resourcePackDelete(filePath)
            },
            screenshot: {
                getScreenshots: (serverId) => GameScreenshot_1.default.getScreenshots(serverId),
                getScreenshotsDirPath: (serverId) => path.join(GlobalPath_1.default.getInstancesDirPath(), serverId, ".minecraft", "screenshots"),
                screenshotDelete: (filePath) => GameScreenshot_1.default.screenshotDelete(filePath)
            }
        },
        os: {
            ram: {
                getTotal: () => Math.round(os.totalmem() / 1024 / 1024 / 1024),
                getFree: () => Math.round(os.freemem() / 1024 / 1024 / 1024)
            },
            java: {
                getPath: () => java.searchLocalPath(),
                checkingPath: (path) => java.checkingJavaPath(path)
            },
            type: () => Utils_1.default.getOSType()
        },
        io: {
            save() {
                launcherStore.save();
            },
            language: {
                get: () => launcherStore.getLanguage(),
                set: (lang) => launcherStore.setLanguage(lang)
            },
            mainDisplayPosition: {
                get: () => launcherStore.getDisplayPosition(),
                set(displayPosition) {
                    if (displayPosition === undefined)
                        throw new Error("displayPosition not null.");
                    launcherStore.setDisplayPosition(displayPosition);
                }
            },
            java: {
                ram: {
                    getMaxSize: (serverName) => launcherStore.getRamSizeMax(serverName),
                    setMaxSize(serverName, size) {
                        if (size === undefined)
                            throw new Error("size not null.");
                        if (serverName === undefined)
                            throw new Error("serverName not null.");
                        launcherStore.setRamSizeMax(serverName, size);
                    },
                    getMinSize: (serverName) => launcherStore.getRamSizeMin(serverName),
                    setMinSize(serverName, size) {
                        if (size === undefined)
                            throw new Error("size not null.");
                        if (serverName === undefined)
                            throw new Error("serverName not null.");
                        launcherStore.setRamSizeMin(serverName, size);
                    },
                    getChecked: (serverName) => launcherStore.getRamChecked(serverName),
                    setChecked(serverName, checked) {
                        if (checked === undefined)
                            throw new Error("checked not null.");
                        if (serverName === undefined)
                            throw new Error("serverName not null.");
                        launcherStore.setRamChecked(serverName, checked);
                    }
                },
                parameter: {
                    get: (serverName) => launcherStore.getJavaParameter(serverName),
                    set(serverName, parameter) {
                        if (parameter === undefined)
                            throw new Error("parameter not null.");
                        launcherStore.setJavaParameter(serverName, parameter);
                    },
                    getChecked: (serverName) => launcherStore.getJavaParameterChecked(serverName),
                    setChecked(serverName, checked) {
                        if (checked === undefined)
                            throw new Error("checked not null.");
                        if (serverName === undefined)
                            throw new Error("serverName not null.");
                        launcherStore.setJavaParameterChecked(serverName, checked);
                    }
                },
                path: {
                    get: (serverName) => launcherStore.getJavaPath(serverName),
                    set(serverName, path) {
                        if (path === undefined)
                            throw new Error("path not null.");
                        if (serverName === undefined)
                            throw new Error("serverName not null.");
                        launcherStore.setJavaPath(serverName, path);
                    },
                    getChecked: (serverName) => launcherStore.getJavaPathChecked(serverName),
                    setChecked(serverName, checked) {
                        if (checked === undefined)
                            throw new Error("checked not null.");
                        if (serverName === undefined)
                            throw new Error("serverName not null.");
                        launcherStore.setJavaPathChecked(serverName, checked);
                    },
                    getIsBuiltInJavaVM: (serverName) => launcherStore.getIsBuiltInJavaVM(serverName),
                    setIsBuiltInJavaVM(serverName, state) {
                        if (state === undefined)
                            throw new Error("state not null.");
                        if (serverName === undefined)
                            throw new Error("serverName not null.");
                        launcherStore.setIsBuiltInJavaVM(serverName, state);
                    }
                }
            },
            general: {
                getOpenGameKeepLauncherState: () => launcherStore.getOpenGameKeepLauncherState(),
                setOpenGameKeepLauncherState: (state) => launcherStore.setOpenGameKeepLauncherState(state),
                getGameStartOpenMonitorLog: () => launcherStore.getGameStartOpenMonitorLog(),
                setGameStartOpenMonitorLog: (state) => launcherStore.setGameStartOpenMonitorLog(state)
            },
            player: {
                getPlayerName: () => launcherStore.getPlayerName(),
                getPlayerUuid: () => launcherStore.getPlayerUuid()
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
            // logger.info("等一下!請你停下你的動作!");
            // logger.info("如果有人叫你在這裡複製/貼上任何東西，你百分之百被騙了。");
            // logger.info("除非你完全明白你在做什麼，否則請關閉此視窗，保護你帳號的安全。");
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
//# sourceMappingURL=preload.js.map