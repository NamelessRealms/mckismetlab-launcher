"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LauncherStore_1 = require("./core/io/LauncherStore");
class CommonPreload {
    constructor(electron, launcherStore) {
        this._electron = electron;
        this._launcherStore = launcherStore !== undefined ? launcherStore : new LauncherStore_1.default();
    }
    init() {
        this._electron.contextBridge.exposeInMainWorld("commonElectronApi", {
            io: {
                language: {
                    get: () => this._launcherStore.getLanguage(),
                }
            }
        });
    }
}
exports.default = CommonPreload;
//# sourceMappingURL=CommonPreload.js.map