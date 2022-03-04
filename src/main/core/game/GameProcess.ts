import * as admZip from "adm-zip";
import * as childProcess from "child_process";
import * as fs from "fs-extra";
import * as electron from "electron";
import * as uuid from "uuid";
import * as path from "path";
import GlobalPath from "../io/GlobalPath";
import LoggerUtil from "../utils/LoggerUtil";
import Utils from "../utils/Utils";

export default class GameProcess {

    private _logger: LoggerUtil = new LoggerUtil("GameProcess");
    private _javaVMStartParameter: IJavaVMStartParameter;
    private _instanceDirPath: string;
    private _gameStartOpenMonitorLog: boolean;
    private _serverId;
    constructor(javaVMStartParameter: IJavaVMStartParameter, gameStartOpenMonitorLog: boolean, serverId: string) {
        this._javaVMStartParameter = javaVMStartParameter;
        this._instanceDirPath = path.join(GlobalPath.getInstancesDirPath(), serverId, ".minecraft");
        this._gameStartOpenMonitorLog = gameStartOpenMonitorLog;
        this._serverId = serverId;
    }

    public start(): childProcess.ChildProcessWithoutNullStreams {

        this._logger.info("創建遊戲子行程...");
        this._logger.info(`server id: ${this._serverId}`);
        this._logger.info(`bin path: ${this._javaVMStartParameter.nativesDirPath}`);
        this._logger.info(`instance dir path: ${this._instanceDirPath}`);
        this._logger.info(`java vm path: ${this._javaVMStartParameter.javaVMPath}`);
        this._logger.info(this._javaVMStartParameter.parameters);

        // flx macos net.minecraft.util.ResourceLocationException: Non [a-z0-9_.-] character in namespace of location: .DS_Store
        if(Utils.getOSType() === "osx" && fs.existsSync(this._instanceDirPath)) childProcess.execSync(`find '${this._instanceDirPath}' -type f -name .DS_Store -exec rm -rf {} +`);

        // un natives jar -> bin dir
        this._unCopyNativesFile();

        if(this._gameStartOpenMonitorLog) {
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

        const minecraftLogger = new LoggerUtil("Minecraft").setFormat("minecraft");

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

    private _unCopyNativesFile(): void {
        for (let nativesPath of this._javaVMStartParameter.nativesFilePaths) {
            const zip = new admZip(nativesPath);
            zip.extractAllTo(this._javaVMStartParameter.nativesDirPath, true);
        }
    }

    private _sendGameLog(data: {  key: string, text: string }): void {
        electron.ipcRenderer.send("gameLog", ["send", data])
    }
}

interface IJavaVMStartParameter {
    javaVMPath: string;
    nativesDirPath: string;
    nativesFilePaths: Array<string>;
    parameters: Array<string>;
}