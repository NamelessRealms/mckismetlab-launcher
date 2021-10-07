import * as electron from "electron";
import * as path from "path";
import * as url from "url";

const isDev = process.env.NODE_ENV === "development";
let win: electron.BrowserWindow | null;

function createWindow() {

    win = new electron.BrowserWindow({
        width: 1280,
        height: 720,
        backgroundColor: "#1E1E1E",
        webPreferences: {
            nodeIntegration: false,
            nodeIntegrationInWorker: false,
            nodeIntegrationInSubFrames: false,
            contextIsolation: true,
            nativeWindowOpen: true,
            webSecurity: true,
            preload: path.join(__dirname, "preload.js")
        }
    });

    if (isDev) {

        win.loadURL("http://localhost:4000");

    } else {

        win.loadURL(
            url.format({
                pathname: path.join(__dirname, "../index.html"),
                protocol: "file:",
                slashes: true
            })
        );

    }

    win.webContents.openDevTools();

    win.on("closed", () => {
        win = null;
    });
}

electron.app.on("ready", createWindow);
