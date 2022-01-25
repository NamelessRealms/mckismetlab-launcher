import * as path from "path";

import ServerLauncherJsonHandler from "../json/ServerLauncherJsonHandler";
import MojangAssetsGameData from "../minecraft/MojangAssetsGameData";
import InstanceIo from "../io/InstanceIo";
import AssetsInstallerDownloader from "../utils/AssetsInstallerDownloader";
import IoFile from "../io/IoFile";
import MinecraftStartParameter from "../minecraft/MinecraftStartParameter";
import GameInstance from "./GameInstance";

import { GameInstanceStateEnum } from "../enum/GameInstanceStateEnum";

export default class GameAssetsInstance {

    public gameInstanceState: GameInstanceStateEnum;
    public percentage: number;

    private _serverId: string;
    private _ioFile: IoFile;

    constructor(serverId: string, ioFile: IoFile) {
        this.gameInstanceState = GameInstanceStateEnum.onStandby;
        this.percentage = 0;
        this._serverId = serverId;
        this._ioFile = ioFile;
    }

    public async validateAssets(): Promise<void> {

        this.gameInstanceState = GameInstanceStateEnum.validate;

        const instanceIo = new InstanceIo(this._serverId);

        const serverLauncherJsonHandler = await new ServerLauncherJsonHandler(this._serverId, instanceIo).serverJsonHandlerDataHandler();
        if(serverLauncherJsonHandler === undefined) throw new Error("Undefined serverJsonData.");

        const mojangAssetsGameData = await new MojangAssetsGameData(serverLauncherJsonHandler.minecraftVersion).mojangAssetsDataHandler();

        await new AssetsInstallerDownloader(serverLauncherJsonHandler, mojangAssetsGameData).validateData();

        const javaVMStartParameter = new MinecraftStartParameter(serverLauncherJsonHandler, mojangAssetsGameData, this._ioFile).getMinecraftJavaStartParameters();

        new GameInstance(javaVMStartParameter, this._ioFile.getGameStartOpenMonitorLog(), this._serverId).start();
    }
}