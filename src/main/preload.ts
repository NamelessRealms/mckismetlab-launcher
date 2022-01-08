import * as electron from "electron";
import got from "got";
import { v4 as uuidv4 } from 'uuid';

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
    },

    uuid: {

        getUUIDv4(): string {
            return uuidv4();
        }

    }
});
