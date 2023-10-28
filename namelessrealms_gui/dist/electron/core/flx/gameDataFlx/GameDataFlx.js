"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = require("fs-extra");
const path = require("path");
const event = require("events");
const GlobalPath_1 = require("../../io/GlobalPath");
const ApiFileService_1 = require("../../../api/ApiFileService");
const Utils_1 = require("../../utils/Utils");
const MojangAssetsGameData_1 = require("../../minecraft/MojangAssetsGameData");
const GameAssetsInstance_1 = require("../../game/GameAssetsInstance");
const ProgressManager_1 = require("../..//utils/ProgressManager");
const GameFlxStateEnum_1 = require("../../../enums/GameFlxStateEnum");
const LoggerUtil_1 = require("../../utils/LoggerUtil");
class GameDataFlx {
    constructor(serverId, ioFile) {
        this._logger = new LoggerUtil_1.default("GameDataFlx");
        this._serverId = serverId;
        this._ioFile = ioFile;
        this._gameFlxState = GameFlxStateEnum_1.GameFlxStateEnum.onStandby;
        this._serverInstanceDir = path.join(GlobalPath_1.default.getInstancesDirPath(), serverId);
        this._eventEmitter = new event.EventEmitter();
        this._progressManager = ProgressManager_1.default.getProgressManagerInstance(this._serverId, this._eventEmitter);
    }
    getFlxType() {
        return this._flxType;
    }
    getProgressManager() {
        return this._progressManager;
    }
    getGameFlxState() {
        return this._gameFlxState;
    }
    setGameFlxState(state) {
        this._gameFlxState = state;
    }
    getEvents() {
        return this._eventEmitter;
    }
    validateFlx(flxType) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                this._flxType = flxType;
                this._gameFlxState = GameFlxStateEnum_1.GameFlxStateEnum.validateFlx;
                if (flxType === "simple") {
                    this._removeServerInstanceDir();
                }
                else if (flxType === "deep") {
                    yield this._deepRemove();
                }
                const gameAssetsInstance = new GameAssetsInstance_1.default(this._serverId, this._ioFile);
                const event = gameAssetsInstance.getEvents();
                event.on("gameCode", (args) => {
                    if (args[0] === 0) {
                        this._gameFlxState = GameFlxStateEnum_1.GameFlxStateEnum.complete;
                        this._eventEmitter.emit("gameCode", [0]);
                    }
                    else if (args[0] === 4) {
                        this._gameFlxState = GameFlxStateEnum_1.GameFlxStateEnum.completeStop;
                        this._eventEmitter.emit("gameCode", [2]);
                    }
                    else {
                        this._gameFlxState = GameFlxStateEnum_1.GameFlxStateEnum.error;
                        this._eventEmitter.emit("gameCode", [1, args[1]]);
                    }
                });
                event.on("progressBarChange", (progressBarData) => {
                    this._eventEmitter.emit("progressBarChange", progressBarData);
                });
                gameAssetsInstance.validateAssets(true);
            }
            catch (error) {
                this._logger.error(error);
                this._gameFlxState = GameFlxStateEnum_1.GameFlxStateEnum.error;
                this._eventEmitter.emit("gameCode", [1, error.toString()]);
            }
        });
    }
    _deepRemove() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // get launcher Assets data
            const serverAssetsObjects = yield ApiFileService_1.default.getLauncherAssetsParser(this._serverId);
            const tempDirPath = path.join(GlobalPath_1.default.getInstancesDirPath(), this._serverId, ".TEMP");
            const assetsDirPath = path.join(GlobalPath_1.default.getCommonDirPath(), "assets");
            const runtimeJavaDirPath = path.join(GlobalPath_1.default.getCommonDirPath(), "runtime", Utils_1.default.getOSType());
            const javaFileDirPath = path.join(runtimeJavaDirPath, serverAssetsObjects.getJavaVMVersion());
            const binDirPath = path.join(GlobalPath_1.default.getCommonDirPath(), "bin");
            const minecraftVersionDirPath = path.join(GlobalPath_1.default.getCommonDirPath(), "versions", serverAssetsObjects.getMinecraftVersion());
            // remove server instance dir
            this._removeServerInstanceDir();
            // remove common temp dir
            if (fs.existsSync(tempDirPath))
                fs.removeSync(tempDirPath);
            // remove modLoaders data
            // new ForgeHandler(this._serverId, serverAssetsObjects.getMinecraftVersion(), { version: serverAssetsObjects.getModLoadersVersion(), downloadUrl: serverAssetsObjects.getModLoadersUrl() }).removeForgeDataHandler();
            // remove minecraft version dir
            if (fs.existsSync(minecraftVersionDirPath))
                fs.removeSync(minecraftVersionDirPath);
            // remove minecraft assets index file json
            const minecraftVersionSplit = serverAssetsObjects.getMinecraftVersion().split(".");
            const assetsId = `${minecraftVersionSplit[0]}.${minecraftVersionSplit[1]}`;
            const minecraftAssetsIndexFilePath = path.join(assetsDirPath, "indexes", `${assetsId}.json`);
            if (fs.existsSync(minecraftAssetsIndexFilePath))
                fs.removeSync(minecraftAssetsIndexFilePath);
            yield new MojangAssetsGameData_1.default(serverAssetsObjects.getMinecraftVersion()).removeMojangAssetsDataHandler();
            // remove libraries
            yield new MojangAssetsGameData_1.default(serverAssetsObjects.getMinecraftVersion()).removeMojangLibrariesHandler();
            // remove java VM
            if (fs.existsSync(javaFileDirPath))
                fs.removeSync(javaFileDirPath);
            // remove bin dir
            if (fs.existsSync(binDirPath))
                fs.removeSync(binDirPath);
        });
    }
    _removeServerInstanceDir() {
        fs.removeSync(this._serverInstanceDir);
    }
}
exports.default = GameDataFlx;
//# sourceMappingURL=GameDataFlx.js.map