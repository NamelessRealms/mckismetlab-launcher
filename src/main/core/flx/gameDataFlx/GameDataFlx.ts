import * as fs from "fs-extra";
import * as path from "path";
import * as event from "events";
import GlobalPath from "../../io/GlobalPath";
import ApiFileService from "../../../api/ApiFileService";
import Utils from "../../utils/Utils";
import MojangAssetsGameData from "../../minecraft/MojangAssetsGameData";
import IoFile from "../../io/IoFile";
import GameAssetsInstance from "../../game/GameAssetsInstance";
import ProgressManager from "../..//utils/ProgressManager";
import ForgeHandler from "../../modLoaders/forge/ForgeHandler";

import { GameFlxStateEnum } from "../../../enums/GameFlxStateEnum";
import { Stop } from "../../utils/ProcessStop";

export default class GameDataFlx {

    private _gameFlxState: GameFlxStateEnum;
    private _serverId: string;
    private _serverInstanceDir: string;
    private _ioFile: IoFile;
    private _eventEmitter: event.EventEmitter;
    private _progressManager: ProgressManager;
    private _flxType: "simple" | "deep" | undefined;

    constructor(serverId: string, ioFile: IoFile) {
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

    public getEvents(): event.EventEmitter {
        return this._eventEmitter;
    }

    public async validateFlx(flxType: "simple" | "deep"): Promise<void> {
        this._flxType = flxType;
        this._gameFlxState = GameFlxStateEnum.validateFlx;

        if (flxType === "simple") {
            this._removeServerInstanceDir();
        } else if (flxType === "deep") {
            await this._deepRemove();
        }

        const gameAssetsInstance = new GameAssetsInstance(this._serverId, this._ioFile);
        gameAssetsInstance.validateAssets(true);

        const event = gameAssetsInstance.getEvents();
        event.on("gameCode", (code: number) => {
            if (code === 0) {
                this._gameFlxState = GameFlxStateEnum.complete;
                this._eventEmitter.emit("gameCode", 0);
            } else if (code === 4) {
                this._gameFlxState = GameFlxStateEnum.stop;
                this._eventEmitter.emit("gameCode", 2);
            } else {
                this._gameFlxState = GameFlxStateEnum.error;
                this._eventEmitter.emit("gameCode", 1);
            } 
        });

        event.on("progressBarChange", (progressBarData: { bigPercentage: number, percentage: number, progressBarText: string }) => {
            this._eventEmitter.emit("progressBarChange", progressBarData);
        });
    }

    private async _deepRemove(): Promise<void> {

        // get launcher Assets data
        const serverLauncherJsonObjects = await ApiFileService.getLauncherAssetsParser(this._serverId);
        const tempDirPath = path.join(GlobalPath.getCommonDirPath(), "temp");
        const assetsDirPath = path.join(GlobalPath.getCommonDirPath(), "assets");
        const runtimeJavaDirPath = path.join(GlobalPath.getCommonDirPath(), "runtime", Utils.getOSType());
        const javaFileDirPath = path.join(runtimeJavaDirPath, serverLauncherJsonObjects.javaVersion);
        const binDirPath = path.join(GlobalPath.getCommonDirPath(), "bin");
        const minecraftVersionDirPath = path.join(GlobalPath.getCommonDirPath(), "versions", serverLauncherJsonObjects.minecraftVersion);

        // remove server instance dir
        this._removeServerInstanceDir();

        // remove common temp dir
        if (fs.existsSync(tempDirPath)) fs.removeSync(tempDirPath);

        // remove modLoaders data
        new ForgeHandler(this._serverId, serverLauncherJsonObjects.minecraftVersion, { version: serverLauncherJsonObjects.modLoadersVersion, downloadUrl: serverLauncherJsonObjects.modLoadersUrl }).removeForgeDataHandler();

        // remove minecraft version dir
        if (fs.existsSync(minecraftVersionDirPath)) fs.removeSync(minecraftVersionDirPath);

        // remove minecraft assets index file json
        const minecraftVersionSplit = serverLauncherJsonObjects.minecraftVersion.split(".");
        const assetsId = `${minecraftVersionSplit[0]}.${minecraftVersionSplit[1]}`;
        const minecraftAssetsIndexFilePath = path.join(assetsDirPath, "indexes", `${assetsId}.json`);
        if (fs.existsSync(minecraftAssetsIndexFilePath)) fs.removeSync(minecraftAssetsIndexFilePath);
        await new MojangAssetsGameData(serverLauncherJsonObjects.minecraftVersion).removeMojangAssetsDataHandler();

        // remove libraries
        await new MojangAssetsGameData(serverLauncherJsonObjects.minecraftVersion).removeMojangLibrariesHandler();

        // remove java VM
        if (fs.existsSync(javaFileDirPath)) fs.removeSync(javaFileDirPath);

        // remove bin dir
        if (fs.existsSync(binDirPath)) fs.removeSync(binDirPath);
    }

    private _removeServerInstanceDir(): void {
        fs.removeSync(this._serverInstanceDir);
    }
}