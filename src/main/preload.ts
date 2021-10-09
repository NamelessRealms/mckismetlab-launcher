import * as electron from "electron";
import got from "got";

electron.contextBridge.exposeInMainWorld("electron", {

    windowApi: {

        minimize(): void {
            electron.ipcRenderer.send("windowApi", "minimize");
        },

        maximize(): void {
            electron.ipcRenderer.send("windowApi", "maximize");
        },

        close(): void {
            electron.ipcRenderer.send("windowApi", "close");
        }
    }
});
