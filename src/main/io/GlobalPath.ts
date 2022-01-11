import * as path from "path";
import * as os from "os";
import Utils from "../utils/Utils";

export default class GlobalPath {

  public static getGameDataDirPath(): string {

    if(Utils.getOSType() === "windows") {

      return path.join(os.homedir(), "AppData", "Roaming", ".mckismetlab");

    } else if(Utils.getOSType() === "osx") {

      return path.join(os.homedir() + "/Library/Application Support/mckismetlab");

    } else {

      throw new Error("unknown os type.");

    }

  }

  public static getInstancesDirPath(): string {
    return path.join(this.getGameDataDirPath(), "instances");
  }

  public static getCommonDirPath(): string {
    return path.join(this.getGameDataDirPath(), "common");
  }
}
