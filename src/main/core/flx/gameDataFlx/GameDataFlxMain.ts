import IoFile from "../../io/IoFile";
import GameDataFlx from "./GameDataFlx";

export default class GameDataFlxMain {

    private static _gameDataFlxMap = new Map();

    public static getGameDataFlxInstance(serverId: string, ioFile: IoFile): GameDataFlx {

        const instance = this._gameDataFlxMap.get(serverId);

        if (instance === undefined) {
            const assetsInstance = new GameDataFlx(serverId, ioFile);
            this._gameDataFlxMap.set(serverId, assetsInstance);
            return assetsInstance;
        } else {
            return instance;
        }
    }

    public static isGameDataFlx(serverId: string): boolean {
        return this._gameDataFlxMap.get(serverId) !== undefined;
    }

    public static deleteGameDataFlx(serverId: string): void {
        this._gameDataFlxMap.delete(serverId);
    }

}