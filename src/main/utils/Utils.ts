import * as admZip from "adm-zip";
import * as fs from "fs-extra";

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
            const zip = new admZip(unZipFilePath);
            zip.extractAllTo(unZipTargetDirPath, true);
            fs.removeSync(unZipFilePath);
            resolve();
        });
    }
}