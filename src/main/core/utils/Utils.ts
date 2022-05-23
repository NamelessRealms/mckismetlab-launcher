import * as admZip from "adm-zip";
import * as fs from "fs-extra";
import LoggerUtil from "./LoggerUtil";

export default class Utils {

    public static getOSType(): "osx" | "windows" | "linux" | "unknown" {
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

    public static unZipFile(unZipFilePath: string, unZipTargetDirPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            new LoggerUtil("Utils").info(`解壓縮 path: ${unZipFilePath} -> ${unZipTargetDirPath}`);
            const zip = new admZip(unZipFilePath);
            zip.extractAllTo(unZipTargetDirPath, true);
            fs.removeSync(unZipFilePath);
            resolve();
        });
    }

    public static isMcVersion(desired: string, actual: string) {

        let des = desired.split(".");
        let act = actual.split(".");

        for (let i = 0; i < des.length; i++) {
            if (!(parseInt(act[i]) >= parseInt(des[i]))) {
                return false;
            }
        }

        return true;
    }

    public static urlLastName(url: string): string | undefined {
        return url.split("/").pop();
    }

    public static isVersion(currVer: string, promoteVer: string): boolean {

        currVer = currVer || "0.0.0";
        promoteVer = promoteVer || "0.0.0";

        if (currVer === promoteVer) return false;

        let currVerArr = currVer.split(".");
        let promoteVerArr = promoteVer.split(".");

        let len = Math.max(currVerArr.length, promoteVerArr.length);

        for (let i = 0; i < len; i++) {
            let proVal = ~~promoteVerArr[i];
            let curVal = ~~currVerArr[i];

            if (proVal < curVal) {
                return false;
            } else if (proVal > curVal) {
                return true;
            }
        }

        return false;
    }

    // Flx curseforge api downloadUrl null issues
    public static flxCurseforgeDownloadUrlNullIssues(fileId: number, fileName: string): string {
        const forgecdnBaseUrl = "https://edge.forgecdn.net";
        const fileIdSplit = fileId.toString().split("");
        const url1 = fileIdSplit.slice(0, 4).join("");
        const url2 = fileIdSplit.slice(4).join("").replace(/^[0]+|$/g, "");
        return `${forgecdnBaseUrl}/files/${url1}/${url2}/${fileName}`;
    }
}