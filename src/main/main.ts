import * as electron from "electron";
import * as path from "path";
import * as url from "url";

import LoggerUtil from "./core/utils/LoggerUtil";

const logger = new LoggerUtil("ElectronMain");
const isDev = process.env.NODE_ENV === "development";
const serverUrl = "http://mckismetlab.net:56100";
const feedUrl = `${serverUrl}/download/latest`;

logger.info("正在啟動 Electron.");

// 處理 Squirrel 事件
logger.info("處理 Squirrel Windows.");
handleWindowsSquirrelEvent()
    .then((shouldRun: Boolean) => {

        logger.info("處理 Squirrel Windows 完成.");

        if (shouldRun) {

            logger.info("退出指令不建立視窗 Main window.");
            electron.app.quit();
            process.exit(0);

        } else {

            logger.info("建立視窗 Main window.");
            start();

        }

    }).catch((error) => {

        logger.info(`Inevitable Demise! ${error.message}`);
        logger.info(error.stack);

        electron.app.quit();
        process.exit(0);

    })

function handleWindowsSquirrelEvent(): Promise<Boolean> {
    return new Promise(async (resolve, reject) => {

        if (process.argv.length === 1) return resolve(false);

        logger.info(`Squirrel Windows 事件代碼: ${process.argv[1]}`);

        const childProcess = require('child_process');

        const appFolder = path.resolve(process.execPath, "..");
        const rootAtomFolder = path.resolve(appFolder, "..");
        const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
        const exeName = path.basename(process.execPath);

        const spawn = (command: string, args: string[]) => {

            let spawnedProcess;

            try {
                spawnedProcess = childProcess.spawn(command, args, { detached: true });
            } catch (error) {
                console.error(error);
            }

            return spawnedProcess;
        };

        const spawnUpdate = (args: string[]) => {
            return spawn(updateDotExe, args);
        };

        const squirrelEvent = process.argv[1];
        switch (squirrelEvent) {
            case "--squirrel-install":
            case "--squirrel-updated":
                // 安裝桌面和開始菜單快捷方式
                spawnUpdate(['--createShortcut', exeName]);
                return resolve(true);
            case "--squirrel-uninstall":
                // 刪除桌面和開始菜單快捷方式
                spawnUpdate(['--removeShortcut', exeName]);
                return resolve(true);
            case '--squirrel-obsolete':
                // 在您的應用的傳出版本之前調用
                // 我們更新到新版本 --squirrel-updated
                return resolve(true);
        }

        return resolve(false);
    });
}

function initSquirrelAutoUpdater(event: Electron.IpcMainEvent) {
    electron.autoUpdater.on("update-available", () => {
        event.sender.send("autoUpdateNotification", ["update_available"]);
    });
    electron.autoUpdater.on("update-downloaded", () => {
        event.sender.send("autoUpdateNotification", ["update_downloaded"]);
    });
    electron.autoUpdater.on("update-not-available", () => {
        event.sender.send("autoUpdateNotification", ["update_not_available"]);
    });
    electron.autoUpdater.on("error", (error) => {
        event.sender.send("autoUpdateNotification", ["realerror", error]);
    });
}

let MainWindow: electron.BrowserWindow | null = null;
let GameLogWindow: electron.BrowserWindow | null = null;
let MSALoginWindow: electron.BrowserWindow | null = null;
let MSALogoutWindow: electron.BrowserWindow | null = null;

function start() {

    const squirrelEvent = process.argv[1];

    electron.ipcMain.on("autoUpdateAction", (event, arg) => {

        if (squirrelEvent !== "--squirrel-firstrun") {

            switch (arg) {
                case "initAutoUpdater":

                    if (!isDev) logger.info("初始化自動更新程式...");

                    electron.autoUpdater.setFeedURL({ url: feedUrl });
                    initSquirrelAutoUpdater(event);

                    event.sender.send("autoUpdateNotification", ["ready"]);

                    break;
                case "updateAvailable":

                    if (!isDev) electron.autoUpdater.checkForUpdates();

                    break;
            }

        } else {
            event.sender.send("autoUpdateNotification", ["firstrun"]);
        }
    });

    // 當最後一個視窗已經關閉的時候終止程式
    electron.app.on("window-all-closed", () => {
        if (process.platform !== "darwin") {
            logger.info("Electron 程式結束! 退出事件: window-all-closed");
            electron.app.quit();
        }
    });

    electron.app.on("activate", () => {
        if (MainWindow === null) createMainWindow();
    });

    electron.app.whenReady().then(() => {
        createMainWindow();
    });
}

function createMainWindow() {

    // show
    // The use of show: false first and win.show() later-on makes the startup smoother.

    MainWindow = new electron.BrowserWindow({
        show: false,
        width: 1280,
        height: 720,
        minWidth: 1280,
        minHeight: 720,
        frame: false,
        // resizable: false,
        roundedCorners: true,
        backgroundColor: "#1E1E1E",
        icon: path.join(__dirname, "../../public/logo.ico"),
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

    MainWindow.once("ready-to-show", () => {
        if (MainWindow !== null) MainWindow.show();
    });

    MainWindow.on("close", () => {
        // save store
        if (MainWindow !== null) MainWindow.webContents.send("io", ["save"]);
    });

    MainWindow.on("closed", () => {

        logger.info("Electron 程式結束! 退出事件: closed");

        MainWindow = null;

        if (GameLogWindow !== null) {
            GameLogWindow.close();
        }

        if (process.platform !== "darwin") {
            electron.app.quit();
        }
    });
}

let GameLogIpc: electron.IpcMainEvent | null = null;

electron.ipcMain.on("openGameLogWindow", (ipcEvent, args) => {

    if (GameLogWindow !== null) {
        ipcEvent.sender.send("GameLogWindowNotification", "error", "AlreadyOpenException");
        return;
    }

    GameLogWindow = new electron.BrowserWindow({
        backgroundColor: "#1E1E1E",
        show: false,
        width: 1280,
        height: 720,
        minWidth: 1280,
        minHeight: 720,
        frame: false,
        icon: path.join(__dirname, "../../public/logo.ico"),
        webPreferences: {
            nodeIntegration: false,
            nodeIntegrationInWorker: false,
            nodeIntegrationInSubFrames: false,
            contextIsolation: true,
            nativeWindowOpen: true,
            webSecurity: true,
            preload: path.join(__dirname, "preloadGameLog.js")
        }
    });

    // 禁用選項按鈕
    GameLogWindow.removeMenu();

    if (isDev) {
        GameLogWindow.webContents.openDevTools();
    }

    GameLogWindow.once("ready-to-show", () => {
        if (GameLogWindow !== null) GameLogWindow.show();
    });

    GameLogWindow.loadURL(pathCreates("gameLog", args[0]));

    GameLogWindow.on("closed", () => {
        GameLogIpc = null;
        GameLogWindow = null;
    });
});

// microsoft login window
const redirectUriPrefix = "https://login.microsoftonline.com/common/oauth2/nativeclient?";
const clientId = "11f704b3-0581-4011-a35d-360c13be5bbe";

let msaLoginNavigate = true;

// open msa login window
electron.ipcMain.on("openMSALoginWindow", (ipcEvent, args) => {

    if (MSALoginWindow !== null) {
        ipcEvent.sender.send("MSALoginWindowNotification", "error");
        return;
    }

    MSALoginWindow = new electron.BrowserWindow({
        title: "Microsoft Login",
        backgroundColor: "#222222",
        width: 520,
        height: 600,
        icon: path.join(__dirname, "../../public/logo.ico")
    });

    if (isDev) MSALoginWindow.webContents.openDevTools();

    MSALoginWindow.on("close", () => {
        if(msaLoginNavigate) ipcEvent.reply("MSALoginWindowNotification", "close");
    });

    MSALoginWindow.on("closed", () => {
        MSALoginWindow = null;
    });

    MSALoginWindow.webContents.on("did-navigate", (event, uri) => {

        if (uri.startsWith(redirectUriPrefix)) {

            msaLoginNavigate = false;

            let querys = uri.substring(redirectUriPrefix.length).split("#", 1).toString().split("&");
            let queryMap = new Map();

            querys.forEach(query => {
                let arr = query.split("=");
                queryMap.set(arr[0], decodeURI(arr[1]));
            });

            ipcEvent.reply("MSALoginWindowNotification", queryMap);

            if (MSALoginWindow !== null) {
                MSALoginWindow.close();
                MSALoginWindow = null;
            }

            msaLoginNavigate = true;
        }
    })

    MSALoginWindow.removeMenu();
    MSALoginWindow.loadURL("https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?prompt=consent&client_id=" + clientId + "&response_type=code&scope=XboxLive.signin%20offline_access&redirect_uri=https://login.microsoftonline.com/common/oauth2/nativeclient");
});

// open msa logout window
electron.ipcMain.on("openMSALogoutWindow", (ipcEvent, args) => {

    if (MSALogoutWindow !== null) {
        ipcEvent.sender.send("MSALogoutWindowNotification", "error");
        return;
    }

    if (MSALogoutWindow == null) {

        MSALogoutWindow = new electron.BrowserWindow({
            title: "Microsoft Logout",
            backgroundColor: "#222222",
            width: 520,
            height: 600,
            icon: path.join(__dirname, "../../public/logo.ico")
        });

        if (isDev) MSALogoutWindow.webContents.openDevTools();

        // 禁用選項按鈕
        MSALogoutWindow.removeMenu();

        MSALogoutWindow.on("close", () => {
            ipcEvent.reply("MSALogoutWindowNotification", "close");
        });

        MSALogoutWindow.on("closed", () => {
            MSALogoutWindow = null;
        });

        MSALogoutWindow.webContents.on("did-navigate", (event, url) => {

            if (url.startsWith("https://login.microsoftonline.com/common/oauth2/v2.0/logoutsession")) {

                setTimeout(() => {
                    ipcEvent.reply("MSALogoutWindowNotification", "session");

                    if (MSALogoutWindow !== null) {
                        MSALogoutWindow.close();
                        MSALogoutWindow = null;
                    }
                }, 5000);
            }

        });

        MSALogoutWindow.loadURL("https://login.microsoftonline.com/common/oauth2/v2.0/logout");
    }
})

function pathCreates(route: string, serverId?: string) {

    let indexPath;

    if (isDev) {
        indexPath = url.format({
            protocol: "http:",
            host: `localhost:4000?viewId=${route}&serverId=${serverId}`,
            slashes: true
        })
    } else {
        indexPath = url.format({
            protocol: "file:",
            pathname: path.join(__dirname, "../index.html"),
            slashes: false
        }) + `?${route}&serverId=${serverId}`;
    }

    return indexPath;
}

electron.ipcMain.on("key", (event, arg) => {
    switch (arg) {
        case "openDevTools":
            if (MainWindow !== null) {
                MainWindow.webContents.openDevTools();
            }
            break;
    }
});

electron.ipcMain.on("gameLog", (event, args) => {

    if (args[0] === "send") {

        if (GameLogIpc === null) {
            return;
        }
        GameLogIpc.sender.send("gameLog", args[1]);

    } else if (args[0] === "on") {
        GameLogIpc = event;
    }

});

electron.ipcMain.on("windowApi", (event, args) => {

    const getWindow = () => {
        switch (args[0]) {
            case "main":
                return MainWindow;
            case "gameLog":
                return GameLogWindow;
            default:
                return null;
        }
    }

    const window = getWindow();

    if (window === null) throw new Error(`windowApi '${args[0]}' null.`);

    switch (args[1]) {
        case "minimize":
            window.minimize();
            break;
        case "maximize":

            if (window.isMaximized()) {
                window.unmaximize();
            } else {
                window.maximize();
            }

            break;
        case "close":
            window.close();
            break;
    }
});