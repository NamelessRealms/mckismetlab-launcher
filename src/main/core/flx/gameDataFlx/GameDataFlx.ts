import * as fs from "fs-extra";
import * as path from "path";
import * as event from "events";
import GlobalPath from "../../io/GlobalPath";
import ApiFileService from "../../../api/ApiFileService";
import Utils from "../../utils/Utils";
import MojangAssetsGameData from "../../minecraft/MojangAssetsGameData";
import LauncherStore from "../../io/LauncherStore";
import GameAssetsInstance from "../../game/GameAssetsInstance";
import ProgressManager from "../..//utils/ProgressManager";
import ForgeHandler from "../../modLoader/forge/ForgeHandler";

import { GameFlxStateEnum } from "../../../enums/GameFlxStateEnum";
import LoggerUtil from "../../utils/LoggerUtil";

export default class GameDataFlx {

    private _logger: LoggerUtil = new LoggerUtil("GameDataFlx");
    private _gameFlxState: GameFlxStateEnum;
    private _serverId: string;
    private _serverInstanceDir: string;
    private _ioFile: LauncherStore;
    private _eventEmitter: event.EventEmitter;
    private _progressManager: ProgressManager;
    private _flxType: "simple" | "deep" | undefined;

    constructor(serverId: string, ioFile: LauncherStore) {
        this._serverId = serverId;
        this._ioFile = ioFile;
        this._gameFlxState = GameFlxStateEnum.onStandby;
        this._serverInstanceDir = path.join(GlobalPath.getInstancesDirPath(), serverId);
        this._eventEmitter = new event.EventEmitter();
        this._progressManager = ProgressManager.getProgressManagerInstance(this._serverId, this._eventEmitter);
    }

    public getFlxType(): "simple" | "deep" | undefined {
        return this._flxType;
    }

    public getProgressManager(): ProgressManager {
        return this._progressManager;
    }

    public getGameFlxState(): GameFlxStateEnum {
        return this._gameFlxState;
    }

    public setGameFlxState(state: GameFlxStateEnum): void {
        this._gameFlxState = state;
    }

    public getEvents(): event.EventEmitter {
        return this._eventEmitter;
    }

    public async validateFlx(flxType: "simple" | "deep"): Promise<void> {
        try {

            this._flxType = flxType;
            this._gameFlxState = GameFlxStateEnum.validateFlx;

            if (flxType === "simple") {
                this._removeServerInstanceDir();
            } else if (flxType === "deep") {
                await this._deepRemove();
            }

            const gameAssetsInstance = new GameAssetsInstance(this._serverId, this._ioFile);

            const event = gameAssetsInstance.getEvents();
            event.on("gameCode", (args) => {
                if (args[0] === 0) {
                    this._gameFlxState = GameFlxStateEnum.complete;
                    this._eventEmitter.emit("gameCode", [0]);
                } else if (args[0] === 4) {
                    this._gameFlxState = GameFlxStateEnum.completeStop;
                    this._eventEmitter.emit("gameCode", [2]);
                } else {
                    this._gameFlxState = GameFlxStateEnum.error;
                    this._eventEmitter.emit("gameCode", [1, args[1]]);
                }
            });

            event.on("progressBarChange", (progressBarData: { bigPercentage: number, percentage: number, progressBarText: string }) => {
                this._eventEmitter.emit("progressBarChange", progressBarData);
            });

            gameAssetsInstance.validateAssets(true);

        } catch (error) {

            this._logger.error(error);
            this._gameFlxState = GameFlxStateEnum.error;
            this._eventEmitter.emit("gameCode", [1, (error as any).toString()]);
        }
    }

    private async _deepRemove(): Promise<void> {

        // get launcher Assets data
        const serverAssetsObjects = await ApiFileService.getLauncherAssetsParser(this._serverId);
        const tempDirPath = path.join(GlobalPath.getInstancesDirPath(), this._serverId, ".TEMP");
        const assetsDirPath = path.join(GlobalPath.getCommonDirPath(), "assets");
        const runtimeJavaDirPath = path.join(GlobalPath.getCommonDirPath(), "runtime", Utils.getOSType());
        const javaFileDirPath = path.join(runtimeJavaDirPath, serverAssetsObjects.getJavaVMVersion());
        const binDirPath = path.join(GlobalPath.getCommonDirPath(), "bin");
        const minecraftVersionDirPath = path.join(GlobalPath.getCommonDirPath(), "versions", serverAssetsObjects.getMinecraftVersion());

        // remove server instance dir
        this._removeServerInstanceDir();

        // remove common temp dir
        if (fs.existsSync(tempDirPath)) fs.removeSync(tempDirPath);

        // remove modLoaders data
        // new ForgeHandler(this._serverId, serverAssetsObjects.getMinecraftVersion(), { version: serverAssetsObjects.getModLoadersVersion(), downloadUrl: serverAssetsObjects.getModLoadersUrl() }).removeForgeDataHandler();

        // remove minecraft version dir
        if (fs.existsSync(minecraftVersionDirPath)) fs.removeSync(minecraftVersionDirPath);

        // remove minecraft assets index file json
        const minecraftVersionSplit = serverAssetsObjects.getMinecraftVersion().split(".");
        const assetsId = `${minecraftVersionSplit[0]}.${minecraftVersionSplit[1]}`;
        const minecraftAssetsIndexFilePath = path.join(assetsDirPath, "indexes", `${assetsId}.json`);
        if (fs.existsSync(minecraftAssetsIndexFilePath)) fs.removeSync(minecraftAssetsIndexFilePath);
        await new MojangAssetsGameData(serverAssetsObjects.getMinecraftVersion()).removeMojangAssetsDataHandler();

        // remove libraries
        await new MojangAssetsGameData(serverAssetsObjects.getMinecraftVersion()).removeMojangLibrariesHandler();

        // remove java VM
        if (fs.existsSync(javaFileDirPath)) fs.removeSync(javaFileDirPath);

        // remove bin dir
        if (fs.existsSync(binDirPath)) fs.removeSync(binDirPath);
    }

    private _removeServerInstanceDir(): void {
        fs.removeSync(this._serverInstanceDir);
    }
}