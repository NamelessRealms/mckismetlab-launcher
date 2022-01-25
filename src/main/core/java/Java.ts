import * as childProcess from "child_process";
import * as path from "path";
import * as fs from "fs-extra";
import log from "electron-log";

import Utils from "../utils/Utils";
import GlobalPath from "../io/GlobalPath";
import Downloader from "../utils/Downloader";

export default class Java {

    public searchLocalPath(): Promise<string> {
        return new Promise((resolve, reject) => {

            const child = childProcess.spawn("java", ["-version"]);

            let stderrData: string;

            child.stderr.on("data", (stderr) => {
                stderrData += stderr;
            });

            child.on("close", () => {

                let data = stderrData.toString().split("\n")[0];
                let javaVersion = new RegExp("java version").test(data) ? data.split(" ")[2].replace(/"/g, "").replace("\r", "") : false;

                if (javaVersion !== false) {
                    // 已安裝 Java
                    log.info("%c成功! 取得 Java 路徑", "color: yellow");

                    if (Utils.getOSType() === "osx") {
                        return resolve(path.join("/Library/Java/JavaVirtualMachines", `jdk-${javaVersion}.jdk`, "Contents", "Home", "bin", "java"));
                    } else if(Utils.getOSType() === "windows") {
                        return resolve(path.join("C:", "Program Files", "Java", `jre${javaVersion}`, "bin", "javaw.exe"));
                    } else {
                        throw new Error("Unknown os type.");
                    }
                    
                } else {
                    // 未安裝 Java
                    log.info("%c失敗! 取得 Java 路徑", "color: yellow");
                    return resolve("");
                }
            });

            child.on("error", (error) => {
                return reject(error);
            });
        });
    }

    public checkingJavaPath(path: string): Promise<boolean> {
        return new Promise((resolve) => {

            if(path === undefined || path.length <= 0) {
                log.info(`%c檢查 Java 路徑不可用 Path: null`, "color: yellow");
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
                if(status) {
                    log.info(`%c檢查 Java 路徑可用 Path: ${path}`, "color: yellow");
                    return resolve(true);
                } else {
                    log.info(`%c檢查 Java 路徑不可用 Path: ${path}`, "color: yellow");
                    return resolve(false);
                }
            });

        });
    }

    // TODO:
    public validateInstallJava(javaData: {
        version: string;
        fileName: string;
        downloadUrl: string;
    }): Promise<void> {
        return new Promise(async (resolve) => {

            const runtimeJavaDirPath = path.join(GlobalPath.getCommonDirPath(), "runtime");
            const javaInstallFilePath = path.join(runtimeJavaDirPath, javaData.fileName);
            const javaFileDirPath = path.join(runtimeJavaDirPath, javaData.version);

            if (!this._isJava(javaFileDirPath)) {
                await Downloader.download(javaData.downloadUrl, javaInstallFilePath);
                await Utils.unZipFile(javaInstallFilePath, javaFileDirPath);

                // Add 0755s permission
                if(Utils.getOSType() !== "windows") {
                    const runtimeJavaDirPath = path.join(GlobalPath.getCommonDirPath(), "runtime", javaData.version, "Contents", "Home", "bin");
                    const readdir = fs.readdirSync(runtimeJavaDirPath);
                    for(let fileName of readdir) {
                        fs.chmodSync(path.join(runtimeJavaDirPath, fileName), "0755");   
                    }
                }
            }

            resolve();
        });
    }

    private _isJava(dirPath: string): boolean {
        return fs.existsSync(dirPath);
    }
}
