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

                if (win.isMaximized()) {
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

    if (isDev) {

        win.loadURL("http://localhost:4000");

        // 開發者視窗
        win.webContents.openDevTools();

    } else {

        win.loadURL(
            url.format({
                pathname: path.join(__dirname, "../index.html"),
                protocol: "file:",
                slashes: true
            })
        );

        win.webContents.openDevTools();

    }

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

// microsoft login window
const redirectUriPrefix = "https://login.microsoftonline.com/common/oauth2/nativeclient?";
const clientId = "11f704b3-0581-4011-a35d-360c13be5bbe";

let MSALoginWindow: electron.BrowserWindow | null = null;

electron.ipcMain.on("openMSALoginWindow", (ipcEvent, args) => {

  if (MSALoginWindow != null) {
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


