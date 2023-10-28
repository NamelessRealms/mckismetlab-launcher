"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admZip = require("adm-zip");
const fs = require("fs-extra");
const LoggerUtil_1 = require("./LoggerUtil");
class Utils {
    static getOSType() {
        switch (process.platform) {
            case "darwin":
                return "osx";
            case "win32":
                return "windows";
            case "linux":
                return "linux";
            default:
                return "unknown";
        }
    }
    static unZipFile(unZipFilePath, unZipTargetDirPath) {
        return new Promise((resolve, reject) => {
            new LoggerUtil_1.default("Utils").info(`解壓縮 path: ${unZipFilePath} -> ${unZipTargetDirPath}`);
            const zip = new admZip(unZipFilePath);
            zip.extractAllTo(unZipTargetDirPath, true);
            fs.removeSync(unZipFilePath);
            resolve();
        });
    }
    static isMcVersion(desired, actual) {
        let des = desired.split(".");
        let act = actual.split(".");
        for (let i = 0; i < des.length; i++) {
            if (!(parseInt(act[i]) >= parseInt(des[i]))) {
                return false;
            }
        }
        return true;
    }
    static urlLastName(url) {
        return url.split("/").pop();
    }
    static isVersion(currVer, promoteVer) {
        currVer = currVer || "0.0.0";
        promoteVer = promoteVer || "0.0.0";
        if (currVer === promoteVer)
            return false;
        let currVerArr = currVer.split(".");
        let promoteVerArr = promoteVer.split(".");
        let len = Math.max(currVerArr.length, promoteVerArr.length);
        for (let i = 0; i < len; i++) {
            let proVal = ~~promoteVerArr[i];
            let curVal = ~~currVerArr[i];
            if (proVal < curVal) {
                return false;
            }
            else if (proVal > curVal) {
                return true;
            }
        }
        return false;
    }
    // Flx curseforge api downloadUrl null issues
    static flxCurseforgeDownloadUrlNullIssues(fileId, fileName) {
        const forgecdnBaseUrl = "https://edge.forgecdn.net";
        const fileIdSplit = fileId.toString().split("");
        const url1 = fileIdSplit.slice(0, 4).join("");
        const url2 = fileIdSplit.slice(4).join("").replace(/^[0]+|$/g, "");
        return `${forgecdnBaseUrl}/files/${url1}/${url2}/${fileName}`;
    }
}
exports.default = Utils;
//# sourceMappingURL=Utils.js.map