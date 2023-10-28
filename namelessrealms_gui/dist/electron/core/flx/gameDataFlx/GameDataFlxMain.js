"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GameDataFlx_1 = require("./GameDataFlx");
class GameDataFlxMain {
    static getGameDataFlxInstance(serverId, ioFile) {
        const instance = this._gameDataFlxMap.get(serverId);
        if (instance === undefined) {
            const assetsInstance = new GameDataFlx_1.default(serverId, ioFile);
            this._gameDataFlxMap.set(serverId, assetsInstance);
            return assetsInstance;
        }
        else {
            return instance;
        }
    }
    static isGameDataFlx(serverId) {
        return this._gameDataFlxMap.get(serverId) !== undefined;
    }
    static deleteGameDataFlx(serverId) {
        this._gameDataFlxMap.delete(serverId);
    }
}
exports.default = GameDataFlxMain;
GameDataFlxMain._gameDataFlxMap = new Map();
//# sourceMappingURL=GameDataFlxMain.js.map