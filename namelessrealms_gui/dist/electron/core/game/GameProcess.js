"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admZip = require("adm-zip");
const childProcess = require("child_process");
const fs = require("fs-extra");
const electron = require("electron");
const uuid = require("uuid");
const path = require("path");
const GlobalPath_1 = require("../io/GlobalPath");
const LoggerUtil_1 = require("../utils/LoggerUtil");
const Utils_1 = require("../utils/Utils");
class GameProcess {
    constructor(javaVMStartParameter, gameStartOpenMonitorLog, serverId) {
        this._logger = new LoggerUtil_1.default("GameProcess");
        this._javaVMStartParameter = javaVMStartParameter;
        this._instanceDirPath = path.join(GlobalPath_1.default.getInstancesDirPath(), serverId, ".minecraft");
        this._gameStartOpenMonitorLog = gameStartOpenMonitorLog;
        this._serverId = serverId;
    }
    start() {
        this._logger.info("創建遊戲子行程...");
        this._logger.info(`server id: ${this._serverId}`);
        this._logger.info(`bin path: ${this._javaVMStartParameter.nativesDirPath}`);
        this._logger.info(`instance dir path: ${this._instanceDirPath}`);
        this._logger.info(`java vm path: ${this._javaVMStartParameter.javaVMPath}`);
        this._logger.info(this._javaVMStartParameter.parameters);
        // flx macos net.minecraft.util.ResourceLocationException: Non [a-z0-9_.-] character in namespace of location: .DS_Store
        if (Utils_1.default.getOSType() === "osx" && fs.existsSync(this._instanceDirPath))
            childProcess.execSync(`find '${this._instanceDirPath}' -type f -name .DS_Store -exec rm -rf {} +`);
        // un natives jar -> bin dir
        this._unCopyNativesFile();
        if (this._gameStartOpenMonitorLog) {
            electron.ipcRenderer.send("openGameLogWindow", [this._serverId]);
        }
        // 以免發生 cwd ENOENT error
        fs.ensureDirSync(this._instanceDirPath);
        const childrenProcess = childProcess.spawn(this._javaVMStartParameter.javaVMPath, this._javaVMStartParameter.parameters, {
            cwd: this._instanceDirPath,
            detached: true
        });
        childrenProcess.stdout.setEncoding("utf8");
        childrenProcess.stderr.setEncoding("utf8");
        const minecraftLogger = new LoggerUtil_1.default("Minecraft").setFormat("minecraft");
        childrenProcess.stdout.on("data", (data) => {
            this._sendGameLog({ key: uuid.v4(), text: data });
        });
        childrenProcess.stderr.on("data", (data) => {
            minecraftLogger.error(data);
        });
        childrenProcess.on("close", (code) => {
            this._logger.info(`遊戲子行程關閉代碼: ${code}`);
        });
        return childrenProcess;
    }
    _unCopyNativesFile() {
        for (let nativesPath of this._javaVMStartParameter.nativesFilePaths) {
            const zip = new admZip(nativesPath);
            zip.extractAllTo(this._javaVMStartParameter.nativesDirPath, true);
        }
    }
    _sendGameLog(data) {
        electron.ipcRenderer.send("gameLog", ["send", data]);
    }
}
exports.default = GameProcess;
//# sourceMappingURL=GameProcess.js.map