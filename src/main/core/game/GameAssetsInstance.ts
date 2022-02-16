import * as event from "events";
import LauncherObjsJsonHandler from "../minecraft/LauncherObjJsonHandler";
import MojangAssetsGameData from "../minecraft/MojangAssetsGameData";
import InstanceIo from "../io/InstanceIo";
import AssetsInstallerDownloader from "../utils/AssetsInstallerDownloader";
import IoFile from "../io/IoFile";
import MinecraftStartParameter from "../minecraft/MinecraftStartParameter";
import GameInstance from "./GameInstance";
import ProgressManager from "../utils/ProgressManager";

import { GameInstanceStateEnum } from "../../enums/GameInstanceStateEnum";
import { ProgressTypeEnum } from "../../enums/ProgressTypeEnum";
import { ProcessStop, Stop } from "../utils/ProcessStop";

export default class GameAssetsInstance {

    private _gameInstanceState: GameInstanceStateEnum;
    private _serverId: string;
    private _ioFile: IoFile;
    private _eventEmitter: event.EventEmitter;
    private _progressManager: ProgressManager;

    constructor(serverId: string, ioFile: IoFile) {
        this._gameInstanceState = GameInstanceStateEnum.onStandby;
        this._serverId = serverId;
        this._ioFile = ioFile;
        this._eventEmitter = new event.EventEmitter();
        this._progressManager = ProgressManager.getProgressManagerInstance(this._serverId, this._eventEmitter);
    }

    public getProgressManager(): ProgressManager {
        return this._progressManager;
    }

    public getGameInstanceState(): GameInstanceStateEnum {
        return this._gameInstanceState;
    }

    public getEvents(): event.EventEmitter {
        return this._eventEmitter;
    }

    public async validateAssets(flx: boolean): Promise<void> {
        try {

            this._gameInstanceState = GameInstanceStateEnum.validate;

            const instanceIo = new InstanceIo(this._serverId);

            const launcherAssetsData = await new LauncherObjsJsonHandler(this._serverId, instanceIo, this._progressManager).serverObjsJsonDHandler();
            ProcessStop.isThrowProcessStopped(this._serverId);

            console.log("launcherObjsJsonHandler Done.");

            const mojangAssetsGameData = await new MojangAssetsGameData(launcherAssetsData.minecraftVersion, this._progressManager).mojangAssetsDataHandler();
            ProcessStop.isThrowProcessStopped(this._serverId);

            console.log("mojangAssetsGameData Done.");

            await new AssetsInstallerDownloader(launcherAssetsData, mojangAssetsGameData, this._progressManager, this._serverId).validateData();
            ProcessStop.isThrowProcessStopped(this._serverId);

            this._gameInstanceState = GameInstanceStateEnum.start;
            this._progressManager.set(ProgressTypeEnum.gameStart, 1, 1);
            if(!flx) {
                const javaVMStartParameter = new MinecraftStartParameter(launcherAssetsData, mojangAssetsGameData, this._ioFile).getMinecraftJavaStartParameters();
                // console.log(javaVMStartParameter.parameters.join("\n"));
                // console.log(javaVMStartParameter.parameters[5].split(":").join("\n"));
                const childrenProcess = new GameInstance(javaVMStartParameter, this._ioFile.getGameStartOpenMonitorLog(), this._serverId).start();
                childrenProcess.on("close", (code) => {
                    if (code === 0) {
                        this._gameInstanceState = GameInstanceStateEnum.close;
                        this._eventEmitter.emit("gameCode", 1);
                    } else {
                        this._gameInstanceState = GameInstanceStateEnum.closeError;
                        this._eventEmitter.emit("gameCode", 2);
                    }
                });
            }

            this._eventEmitter.emit("gameCode", 0);

        } catch (error) {

            if(error instanceof Stop) {
                console.log("Throw process stopped.");
                this._gameInstanceState = GameInstanceStateEnum.stop;
                this._eventEmitter.emit("gameCode", 4);
                return;
            }

            console.error(error);
            this._gameInstanceState = GameInstanceStateEnum.startError;
            this._eventEmitter.emit("gameCode", 3);
        }
    }
}