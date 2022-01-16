import ServerLauncherJsonHandler from "../json/ServerLauncherJsonHandler";
import { GameInstanceStateEnum } from "../enum/GameInstanceStateEnum";
import MojangAssetsGameData from "../minecraft/MojangAssetsGameData";

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

        const serverLauncherJsonHandler = await new ServerLauncherJsonHandler(this._serverId).serverJsonHandlerDataHandler();
        if(serverLauncherJsonHandler === undefined) throw new Error("Undefined serverJsonData.");

        console.log(serverLauncherJsonHandler);

        // const mojangAssetsGameData = await new MojangAssetsGameData(serverLauncherJsonHandler.minecraftVersion).mojangAssetsDataHandler();
    }
}