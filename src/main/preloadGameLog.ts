import * as electron from "electron";
import * as path from "path";
import GlobalPath from "./core/io/GlobalPath";

electron.contextBridge.exposeInMainWorld("gameLogElectron", {

    windowApi: {
        minimize: () => electron.ipcRenderer.send("windowApi", ["gameLog", "minimize"]),
        maximize: () => electron.ipcRenderer.send("windowApi", ["gameLog", "maximize"]),
        close: () => electron.ipcRenderer.send("windowApi", ["gameLog", "close"])
    },

    open: {
        pathFolder: (path: string) => electron.shell.openPath(path),
    },

    path: {
        getGameLogsDirPath: (serverId: string) => path.join(GlobalPath.getInstancesDirPath(), serverId, ".minecraft", "logs")
    },

    event: {
        onGameLog(callback: (data: { key: string, text: string  }) => void): void {
            electron.ipcRenderer.send("gameLog", ["on"]);
            electron.ipcRenderer.on("gameLog", (event, data) => {
                callback(data);
            });
        }
    }

})