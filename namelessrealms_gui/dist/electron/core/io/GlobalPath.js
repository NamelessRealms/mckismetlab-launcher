"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const os = require("os");
const Utils_1 = require("../utils/Utils");
class GlobalPath {
    static getGameDataDirPath() {
        if (Utils_1.default.getOSType() === "windows") {
            return path.join(os.homedir(), "AppData", "Roaming", ".mckismetlab");
        }
        else if (Utils_1.default.getOSType() === "osx") {
            return path.join(os.homedir() + "/Library/Application Support/mckismetlab");
        }
        else {
            throw new Error("unknown os type.");
        }
    }
    static getInstancesDirPath() {
        return path.join(this.getGameDataDirPath(), "instances");
    }
    static getCommonDirPath() {
        return path.join(this.getGameDataDirPath(), "common");
    }
}
exports.default = GlobalPath;
//# sourceMappingURL=GlobalPath.js.map