import * as event from "events";
import LauncherObjsJsonHandler from "../minecraft/LauncherObjJsonHandler";
import MojangAssetsGameData from "../minecraft/MojangAssetsGameData";
import InstanceStore from "../io/InstanceStore";
import AssetsInstallerDownloader from "../utils/AssetsInstallerDownloader";
import IoFile from "../io/IoFile";
import MinecraftStartParameter from "../minecraft/MinecraftStartParameter";
import GameProcess from "./GameProcess";
import ProgressManager from "../utils/ProgressManager";

import { GameInstanceStateEnum } from "../../enums/GameInstanceStateEnum";
import { ProgressTypeEnum } from "../../enums/ProgressTypeEnum";
import { ProcessStop, Stop } from "../utils/ProcessStop";
import LoggerUtil from "../utils/LoggerUtil";

export default class GameAssetsInstance {

    private _logger: LoggerUtil = new LoggerUtil("GameAssetsInstance");
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
            this._logger.info("開始處理資料");
            this._logger.info(`GameInstanceState: ${this._gameInstanceState}`);

            const instanceIo = new InstanceStore(this._serverId);

            const launcherAssetsData = await new LauncherObjsJsonHandler(this._serverId, instanceIo, this._progressManager).serverObjsJsonDHandler();
            ProcessStop.isThrowProcessStopped(this._serverId);
            this._logger.info("launcherAssetsData Done.");

            const mojangAssetsGameData = await new MojangAssetsGameData(launcherAssetsData.minecraftVersion, this._progressManager).mojangAssetsDataHandler();
            ProcessStop.isThrowProcessStopped(this._serverId);
            this._logger.info("mojangAssetsGameData Done.");

            await new AssetsInstallerDownloader(launcherAssetsData, mojangAssetsGameData, this._progressManager, this._serverId).validateData();
            ProcessStop.isThrowProcessStopped(this._serverId);
            this._logger.info("AssetsInstallerDownloader Done.");

            this._gameInstanceState = GameInstanceStateEnum.start;
            this._progressManager.set(ProgressTypeEnum.gameStart, 1, 1);
            this._logger.info(`GameInstanceState: ${this._gameInstanceState}`);

            if(!flx) {
                const javaVMStartParameter = new MinecraftStartParameter(launcherAssetsData, mojangAssetsGameData, this._ioFile).getMinecraftJavaStartParameters();
                // console.log(javaVMStartParameter.parameters.join("\n"));
                // console.log(javaVMStartParameter.parameters[5].split(":").join("\n"));
                const childrenProcess = new GameProcess(javaVMStartParameter, this._ioFile.getGameStartOpenMonitorLog(), this._serverId).start();
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
                this._logger.info("啟動正常停止");
                this._gameInstanceState = GameInstanceStateEnum.stop;
                this._eventEmitter.emit("gameCode", 4);
                return;
            }

            this._logger.error(error);
            this._gameInstanceState = GameInstanceStateEnum.startError;
            this._eventEmitter.emit("gameCode", 3);
        }
    }
}