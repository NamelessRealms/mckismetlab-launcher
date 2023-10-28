"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const event = require("events");
const electron = require("electron");
const LauncherObjJsonHandler_1 = require("../minecraft/LauncherObjJsonHandler");
const MojangAssetsGameData_1 = require("../minecraft/MojangAssetsGameData");
const InstanceStore_1 = require("../io/InstanceStore");
const AssetsInstallerDownloader_1 = require("../utils/AssetsInstallerDownloader");
const MinecraftStartParameter_1 = require("../minecraft/MinecraftStartParameter");
const GameProcess_1 = require("./GameProcess");
const ProgressManager_1 = require("../utils/ProgressManager");
const GameInstanceStateEnum_1 = require("../../enums/GameInstanceStateEnum");
const ProgressTypeEnum_1 = require("../../enums/ProgressTypeEnum");
const ProcessStop_1 = require("../utils/ProcessStop");
const LoggerUtil_1 = require("../utils/LoggerUtil");
class GameAssetsInstance {
    constructor(serverId, ioFile) {
        this._logger = new LoggerUtil_1.default("GameAssetsInstance");
        this._gameInstanceState = GameInstanceStateEnum_1.GameInstanceStateEnum.onStandby;
        this._serverId = serverId;
        this._launcherStore = ioFile;
        this._eventEmitter = new event.EventEmitter();
        this._progressManager = ProgressManager_1.default.getProgressManagerInstance(this._serverId, this._eventEmitter);
    }
    getProgressManager() {
        return this._progressManager;
    }
    getGameInstanceState() {
        return this._gameInstanceState;
    }
    setGameInstanceState(state) {
        this._gameInstanceState = state;
    }
    getEvents() {
        return this._eventEmitter;
    }
    validateAssets(flx) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                this._gameInstanceState = GameInstanceStateEnum_1.GameInstanceStateEnum.validate;
                this._logger.info("開始處理資料");
                this._logger.info(`GameInstanceState: ${this._gameInstanceState}`);
                const instanceIo = new InstanceStore_1.default(this._serverId);
                const launcherAssetsData = yield new LauncherObjJsonHandler_1.default(this._serverId, instanceIo, this._progressManager).serverObjsJsonDHandler();
                ProcessStop_1.ProcessStop.isThrowProcessStopped(this._serverId);
                this._logger.info("launcherAssetsData Done.");
                const mojangAssetsGameData = yield new MojangAssetsGameData_1.default(launcherAssetsData.minecraftVersion, this._progressManager).mojangAssetsDataHandler();
                ProcessStop_1.ProcessStop.isThrowProcessStopped(this._serverId);
                this._logger.info("mojangAssetsGameData Done.");
                yield new AssetsInstallerDownloader_1.default(launcherAssetsData, mojangAssetsGameData, this._progressManager, this._serverId).validateData();
                ProcessStop_1.ProcessStop.isThrowProcessStopped(this._serverId);
                this._logger.info("AssetsInstallerDownloader Done.");
                this._gameInstanceState = GameInstanceStateEnum_1.GameInstanceStateEnum.start;
                this._progressManager.set(ProgressTypeEnum_1.ProgressTypeEnum.gameStart, 1, 1);
                this._logger.info(`GameInstanceState: ${this._gameInstanceState}`);
                if (!flx) {
                    const javaVMStartParameter = new MinecraftStartParameter_1.default(launcherAssetsData, mojangAssetsGameData, this._launcherStore).getMinecraftJavaStartParameters();
                    const childrenProcess = new GameProcess_1.default(javaVMStartParameter, this._launcherStore.getGameStartOpenMonitorLog(), this._serverId).start();
                    childrenProcess.on("close", (code) => {
                        if (code === 0) {
                            this._gameInstanceState = GameInstanceStateEnum_1.GameInstanceStateEnum.close;
                            this._eventEmitter.emit("gameCode", [1]);
                        }
                        else {
                            this._gameInstanceState = GameInstanceStateEnum_1.GameInstanceStateEnum.closeError;
                            this._eventEmitter.emit("gameCode", [2, "Minecraft Crash !!!"]);
                        }
                    });
                    if (!this._launcherStore.getOpenGameKeepLauncherState()) {
                        electron.ipcRenderer.send("close");
                    }
                }
                this._eventEmitter.emit("gameCode", [0]);
            }
            catch (error) {
                if (error instanceof ProcessStop_1.Stop) {
                    this._logger.info("啟動正常停止");
                    this._gameInstanceState = GameInstanceStateEnum_1.GameInstanceStateEnum.completeStop;
                    this._eventEmitter.emit("gameCode", [4]);
                    return;
                }
                if (error instanceof Error) {
                    this._logger.error(error);
                    this._eventEmitter.emit("gameCode", [3, error.toString()]);
                }
                else {
                    this._logger.error(JSON.stringify(error));
                    this._eventEmitter.emit("gameCode", [3, JSON.stringify(error)]);
                }
                this._gameInstanceState = GameInstanceStateEnum_1.GameInstanceStateEnum.startError;
            }
        });
    }
}
exports.default = GameAssetsInstance;
//# sourceMappingURL=GameAssetsInstance.js.map