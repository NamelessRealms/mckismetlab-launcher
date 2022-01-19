import * as electron from "electron";
import * as path from "path";
import * as url from "url";

const isDev = process.env.NODE_ENV === "development";
let MainWindow: electron.BrowserWindow | null;

electron.ipcMain.on("key", (event, arg) => {
    switch (arg) {
        case "openDevTools":
            if (MainWindow !== null) {
                MainWindow.webContents.openDevTools();
            }
            break;
    }
});

electron.app.on("ready", () => {

    electron.ipcMain.on("windowApi", (event, args) => {

        if (MainWindow === null) {
            return;
        }

        switch (args) {
            case "minimize":
                MainWindow.minimize();
                break;
            case "maximize":

                if (MainWindow.isMaximized()) {
                    MainWindow.unmaximize();
                } else {
                    MainWindow.maximize();
                }

                break;
            case "close":
                MainWindow.close();
                break;
        }
    });

    createMainWindow();
});

function createMainWindow() {

    MainWindow = new electron.BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 1280,
        minHeight: 720,
        frame: false,
        resizable: false,
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

    if(isDev) {
        MainWindow.webContents.openDevTools();
    }

    MainWindow.loadURL(pathCreates("main"));

    // 禁用選項按鈕
    MainWindow.removeMenu();

    // Electron 正確導入開啟瀏覽器的路徑
    MainWindow.webContents.on("new-window", (event, url) => {
        event.preventDefault();
        electron.shell.openExternal(url);
    });

    MainWindow.on("closed", () => {

        MainWindow = null;

        console.log("%cElectron 程式結束! 退出事件: closed", "color: magenta");

        if (process.platform !== "darwin") {
            electron.app.quit();
        }
    });
}

let GameLogWindow: electron.BrowserWindow | null = null;

electron.ipcMain.on("openGameLogWindow", (ipcEvent, args) => {

    if(GameLogWindow !== null) {
        ipcEvent.sender.send("GameLogWindowNotification", "error", "AlreadyOpenException");
        return;
    }

    GameLogWindow = new electron.BrowserWindow({
        backgroundColor: "#1E1E1E",
        width: 1280,
        height: 720,
        minWidth: 1280,
        minHeight: 720,
        frame: false
    });

    if(isDev) {
        GameLogWindow.webContents.openDevTools();
    }

    GameLogWindow.loadURL(pathCreates("gameLog"));

    GameLogWindow.on("closed", () => {
        GameLogWindow = null;
    });
});

// microsoft login window
const redirectUriPrefix = "https://login.microsoftonline.com/common/oauth2/nativeclient?";
const clientId = "11f704b3-0581-4011-a35d-360c13be5bbe";

let MSALoginWindow: electron.BrowserWindow | null = null;

electron.ipcMain.on("openMSALoginWindow", (ipcEvent, args) => {

    if (MSALoginWindow !== null) {
        ipcEvent.sender.send("MSALoginWindowNotification", "error", "AlreadyOpenException");
        return;
    }

    MSALoginWindow = new electron.BrowserWindow({
        title: "Microsoft Login",
        backgroundColor: "#222222",
        width: 520,
        height: 600,
        frame: false
    });

    if (isDev) MSALoginWindow.webContents.openDevTools();

    MSALoginWindow.on("closed", () => {
        MSALoginWindow = null
    });

    MSALoginWindow.webContents.on("did-navigate", (event, uri, responseCode, statusText) => {

        if (uri.startsWith(redirectUriPrefix)) {

            let querys = uri.substring(redirectUriPrefix.length).split("#", 1).toString().split("&");
            let queryMap = new Map();

            querys.forEach(query => {
                let arr = query.split("=");
                queryMap.set(arr[0], decodeURI(arr[1]));
            });

            ipcEvent.reply("MSALoginWindowReply", queryMap);

            if (MSALoginWindow !== null) {
                MSALoginWindow.close();
                MSALoginWindow = null;
            }
        }
    })

    MSALoginWindow.removeMenu();
    MSALoginWindow.loadURL("https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?prompt=consent&client_id=" + clientId + "&response_type=code&scope=XboxLive.signin%20offline_access&redirect_uri=https://login.microsoftonline.com/common/oauth2/nativeclient");
});

function pathCreates(route: string) {
    
    let indexPath;

    if(isDev) {
        indexPath = url.format({
            protocol: "http:",
            host: `localhost:4000?${route}`,
            slashes: true
        })
    } else {
        indexPath = url.format({
            protocol: "file:",
            pathname: path.join(__dirname, "../index.html"),
            slashes: false
        }) + `?${route}`;
    }

    return indexPath;
}