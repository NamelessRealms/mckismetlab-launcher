import * as electron from "electron";
import * as path from "path";
import * as url from "url";

const isDev = process.env.NODE_ENV === "development";
let win: electron.BrowserWindow | null;

electron.app.on("ready", () => {

    electron.ipcMain.on("windowApi", (event, args) => {

        if (win === null) {
            return;
        }

        switch (args) {
            case "minimize":
                win.minimize();
                break;
            case "maximize":

                if(win.isMaximized()) {
                    win.unmaximize();
                } else {
                    win.maximize();
                }

                break;
            case "close":
                win.close();
                break;
        }
    });

    createMainWindow();
});

function createMainWindow() {

    win = new electron.BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 1280,
        minHeight: 720,
        frame: false,
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

    // 開發者視窗
    win.webContents.openDevTools();
    // 禁用選項按鈕
    win.removeMenu();

    // Electron 正確導入開啟瀏覽器的路徑
    win.webContents.on("new-window", (event, url) => {
        event.preventDefault();
        electron.shell.openExternal(url);
    });

    win.on("closed", () => {

        win = null;

        console.log("%cElectron 程式結束! 退出事件: closed", "color: magenta");

        if (process.platform !== "darwin") {
            electron.app.quit();
        }
    });
}


