"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron = require("electron");
const path = require("path");
const GlobalPath_1 = require("./core/io/GlobalPath");
const CommonPreload_1 = require("./CommonPreload");
const Utils_1 = require("./core/utils/Utils");
new CommonPreload_1.default(electron).init();
electron.contextBridge.exposeInMainWorld("gameLogElectron", {
    windowApi: {
        minimize: () => electron.ipcRenderer.send("windowApi", ["gameLog", "minimize"]),
        maximize: () => electron.ipcRenderer.send("windowApi", ["gameLog", "maximize"]),
        close: () => electron.ipcRenderer.send("windowApi", ["gameLog", "close"])
    },
    open: {
        pathFolder: (path) => electron.shell.openPath(path),
    },
    path: {
        getGameLogsDirPath: (serverId) => path.join(GlobalPath_1.default.getInstancesDirPath(), serverId, ".minecraft", "logs")
    },
    event: {
        onGameLog(callback) {
            electron.ipcRenderer.send("gameLog", ["on"]);
            electron.ipcRenderer.on("gameLog", (event, data) => callback(data));
        }
    },
    os: {
        type: () => Utils_1.default.getOSType()
    },
});
//# sourceMappingURL=preloadGameLog.js.map