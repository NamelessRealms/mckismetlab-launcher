import * as electron from "electron";
import got from "got";

electron.contextBridge.exposeInMainWorld("electron", {

    window: {

        maximize(): void {
            electron.BrowserWindow.getAllWindows().forEach((window) => {
                window.maximize();
            });
        },

        minimize(): void {
            electron.BrowserWindow.getAllWindows().forEach((window) => {
                window.minimize();
            });
        },

        close(): void {
            electron.BrowserWindow.getAllWindows().forEach((window) => {
                window.close();
            });
        }
    }
});
