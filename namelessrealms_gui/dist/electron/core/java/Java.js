"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const childProcess = require("child_process");
const path = require("path");
const fs = require("fs-extra");
const Utils_1 = require("../utils/Utils");
const GlobalPath_1 = require("../io/GlobalPath");
const Downloader_1 = require("../utils/Downloader");
const LoggerUtil_1 = require("../utils/LoggerUtil");
const ProgressTypeEnum_1 = require("../../enums/ProgressTypeEnum");
class Java {
    constructor(progressManager) {
        this._logger = new LoggerUtil_1.default("Preload");
        this._progressManager = progressManager;
    }
    searchLocalPath() {
        return new Promise((resolve, reject) => {
            const child = childProcess.spawn("java", ["-version"]);
            let stderrData;
            child.stderr.on("data", (stderr) => {
                stderrData += stderr;
            });
            child.on("close", () => {
                let data = stderrData.toString().split("\n")[0];
                let javaVersion = new RegExp("java version").test(data) ? data.split(" ")[2].replace(/"/g, "").replace("\r", "") : false;
                if (javaVersion !== false) {
                    // 已安裝 Java
                    this._logger.info("成功! 取得 Java 路徑");
                    if (Utils_1.default.getOSType() === "osx") {
                        return resolve(path.join("/Library/Java/JavaVirtualMachines", `jdk-${javaVersion}.jdk`, "Contents", "Home", "bin", "java"));
                    }
                    else if (Utils_1.default.getOSType() === "windows") {
                        return resolve(path.join("C:", "Program Files", "Java", `jre${javaVersion}`, "bin", "javaw.exe"));
                    }
                    else {
                        throw new Error("Unknown os type.");
                    }
                }
                else {
                    // 未安裝 Java
                    this._logger.info("失敗! 取得 Java 路徑");
                    return resolve("");
                }
            });
            child.on("error", (error) => {
                return reject(error);
            });
        });
    }
    checkingJavaPath(path) {
        return new Promise((resolve) => {
            if (path === undefined || path.length <= 0) {
                this._logger.info(`檢查 Java 路徑不可用 Path: null`);
                return resolve(false);
            }
            const child = childProcess.spawn(path, ["-version"]);
            let status = false;
            child.stderr.on("data", () => {
                status = true;
            });
            child.on("error", () => {
                status = false;
            });
            child.on("close", () => {
                if (status) {
                    this._logger.info(`檢查 Java 路徑可用 Path: ${path}`);
                    return resolve(true);
                }
                else {
                    this._logger.info(`檢查 Java 路徑不可用 Path: ${path}`);
                    return resolve(false);
                }
            });
        });
    }
    validateInstallJava(javaData) {
        return new Promise((resolve) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const runtimeJavaDirPath = path.join(GlobalPath_1.default.getCommonDirPath(), "runtime", Utils_1.default.getOSType());
            const javaInstallFilePath = path.join(runtimeJavaDirPath, javaData.fileName);
            const javaFileDirPath = path.join(runtimeJavaDirPath, javaData.version);
            if (!this._isJava(javaFileDirPath)) {
                yield Downloader_1.default.download(javaData.downloadUrl, javaInstallFilePath, (percent) => {
                    if (this._progressManager !== undefined)
                        this._progressManager.set(ProgressTypeEnum_1.ProgressTypeEnum.validateDownloadJava, percent);
                });
                yield Utils_1.default.unZipFile(javaInstallFilePath, javaFileDirPath);
                // Add 0755s permission
                if (Utils_1.default.getOSType() !== "windows") {
                    const runtimeJavaDirPath = path.join(GlobalPath_1.default.getCommonDirPath(), "runtime", Utils_1.default.getOSType(), javaData.version, "Contents", "Home", "bin");
                    const readdir = fs.readdirSync(runtimeJavaDirPath);
                    for (let fileName of readdir) {
                        fs.chmodSync(path.join(runtimeJavaDirPath, fileName), "0755");
                    }
                }
            }
            resolve();
        }));
    }
    _isJava(dirPath) {
        const isExists = fs.existsSync(dirPath);
        this._logger.info(`是否有檔案 -> ${isExists}`);
        return isExists;
    }
}
exports.default = Java;
//# sourceMappingURL=Java.js.map