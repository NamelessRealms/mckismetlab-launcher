import IoFile from "../io/IoFile";
import GameAssetsInstance from "./GameAssetsInstance";

export default class AssetsMain {

    private static _gameInstanceMap = new Map();

    public static getGameInstance(serverId: string, ioFile: IoFile): GameAssetsInstance {

        const instance = this._gameInstanceMap.get(serverId);

        if (instance === undefined) {
            const assetsInstance = new GameAssetsInstance(serverId, ioFile);
            this._gameInstanceMap.set(serverId, assetsInstance);
            return assetsInstance;
        } else {
            return instance;
        }
    }

    public static isGameInstance(serverId: string): boolean {
        return this._gameInstanceMap.get(serverId) !== undefined;
    }

    public static deleteGameInstance(serverId: string): void {
        this._gameInstanceMap.delete(serverId);
    }

}