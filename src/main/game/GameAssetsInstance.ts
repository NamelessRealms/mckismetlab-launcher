import ServerLauncherJsonHandler from "../json/ServerLauncherJsonHandler";
import MojangAssetsGameData from "../minecraft/MojangAssetsGameData";
import InstanceIo from "../io/InstanceIo";

import { GameInstanceStateEnum } from "../enum/GameInstanceStateEnum";
import AssetsInstallerDownloader from "../utils/AssetsInstallerDownloader";

export default class GameAssetsInstance {

    public gameInstanceState: GameInstanceStateEnum;
    public percentage: number;

    private _serverId: string;

    constructor(serverId: string) {
        this.gameInstanceState = GameInstanceStateEnum.onStandby;
        this.percentage = 0;
        this._serverId = serverId;
    }

    public async validateAssets(): Promise<void> {

        this.gameInstanceState = GameInstanceStateEnum.validate;

        const instanceIo = new InstanceIo(this._serverId);

        const serverLauncherJsonHandler = await new ServerLauncherJsonHandler(this._serverId, instanceIo).serverJsonHandlerDataHandler();
        if(serverLauncherJsonHandler === undefined) throw new Error("Undefined serverJsonData.");

        const mojangAssetsGameData = await new MojangAssetsGameData(serverLauncherJsonHandler.minecraftVersion).mojangAssetsDataHandler();

        new AssetsInstallerDownloader(serverLauncherJsonHandler, mojangAssetsGameData).validateData();
    }
}