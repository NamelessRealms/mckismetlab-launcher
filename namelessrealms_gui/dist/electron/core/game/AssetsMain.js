"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GameAssetsInstance_1 = require("./GameAssetsInstance");
class AssetsMain {
    static getGameInstance(serverId, ioFile) {
        const instance = this._gameInstanceMap.get(serverId);
        if (instance === undefined) {
            const assetsInstance = new GameAssetsInstance_1.default(serverId, ioFile);
            this._gameInstanceMap.set(serverId, assetsInstance);
            return assetsInstance;
        }
        else {
            return instance;
        }
    }
    static isGameInstance(serverId) {
        return this._gameInstanceMap.get(serverId) !== undefined;
    }
    static deleteGameInstance(serverId) {
        this._gameInstanceMap.delete(serverId);
    }
}
exports.default = AssetsMain;
AssetsMain._gameInstanceMap = new Map();
//# sourceMappingURL=AssetsMain.js.map