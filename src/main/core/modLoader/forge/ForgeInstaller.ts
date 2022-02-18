import * as path from "path";
import * as childProcess from "child_process";
import * as fs from "fs-extra";
import * as iconv from "iconv-lite";

import IModLoader from "../../../interfaces/IModLoader";
import GlobalPath from "../../io/GlobalPath";
import Utils from "../../utils/Utils";
import ProgressManager from "../../utils/ProgressManager";
import { ProgressTypeEnum } from "../../../enums/ProgressTypeEnum";
import IForgeInstallProfile from "../../../interfaces/IForgeInstallProfile";
import LoggerUtil from "../../utils/LoggerUtil";

export default class ForgeInstaller {

  private _logger = new LoggerUtil("ForgeInstaller");
  private _minecraftVersion;
  private _forgeInstallLibraries;
  private _forgeInstallProcessors;
  private _librariesDirPath;
  private _forgeInstallData;
  private _commonDirPath;
  private _clientLzmaPath;
  private _progressManager: ProgressManager;

  constructor(minecraftVersion: string, forgeInstallProfile: IForgeInstallProfile, progressManager: ProgressManager) {
    this._minecraftVersion = minecraftVersion;
    this._forgeInstallLibraries = forgeInstallProfile.libraries;
    this._forgeInstallProcessors = forgeInstallProfile.processors;
    this._forgeInstallData = forgeInstallProfile.data;
    this._librariesDirPath = path.join(GlobalPath.getCommonDirPath(), "libraries");
    this._commonDirPath = GlobalPath.getCommonDirPath();
    this._clientLzmaPath = forgeInstallProfile.clientLzmaPath;
    this._progressManager = progressManager;
  }

  public async install(): Promise<void> {

    this._logger.info("安裝 Forge 第一階段開始");
    this._progressManager.set(ProgressTypeEnum.validateInstallModLoader, 1, 5);
    const installerTools = this._installerTools();
    await this._childBuild(installerTools);

    this._logger.info("安裝 Forge 第二階段開始");
    this._progressManager.set(ProgressTypeEnum.validateInstallModLoader, 2, 5);
    const jarsplitter = this._jarsplitter();
    await this._childBuild(jarsplitter);

    this._logger.info("安裝 Forge 第三階段開始");
    this._progressManager.set(ProgressTypeEnum.validateInstallModLoader, 3, 5);
    const specialSource = this._specialSource();
    await this._childBuild(specialSource);

    this._logger.info("安裝 Forge 第四階段開始");
    this._progressManager.set(ProgressTypeEnum.validateInstallModLoader, 4, 5);
    const binarypatcher = this._binarypatcher();
    await this._childBuild(binarypatcher);

    this._progressManager.set(ProgressTypeEnum.validateInstallModLoader, 5, 5);
  }

  private _binarypatcher() {

    let array = [];

    const libraries = this._forgeInstallLibraries;
    const processors = this._forgeInstallProcessors[3];

    array.push("-cp");
    array.push(this._getClassPath(processors.classpath, libraries, processors.jar));

    array.push("net.minecraftforge.binarypatcher.ConsoleTool");

    for (let i = 0; i < processors.args.length; i++) {

      let item = processors.args[i];
      let itemTwo = processors.args[i + 1];
      let val = null;

      switch (item) {
        case "--clean":
          val = this._getInstallJsonData(itemTwo);
          break;
        case "--output":
          val = this._getInstallJsonData(itemTwo);
          break;
        case "--apply":
          val = this._clientLzmaPath;
          break;
      }

      if (val !== null) {
        array.push(item);
        array.push(val);
      }
    }

    return array;
  }

  private _specialSource() {

    let array = [];

    const libraries = this._forgeInstallLibraries;
    const processors = this._forgeInstallProcessors[2];

    array.push("-cp");
    array.push(this._getClassPath(processors.classpath, libraries, processors.jar));

    array.push("net.md_5.specialsource.SpecialSource");

    for (let i = 0; i < processors.args.length; i++) {

      let item = processors.args[i];
      let itemTwo = processors.args[i + 1];
      let val = null;

      switch (item) {
        case "--in-jar":
          val = this._getInstallJsonData(itemTwo);
          break;
        case "--out-jar":
          val = this._getInstallJsonData(itemTwo);
          break;
        case "--srg-in":
          val = this._getInstallJsonData(itemTwo);
          break;
      }

      if (val !== null) {
        array.push(item);
        array.push(val);
      }
    }

    return array;
  }

  private _jarsplitter() {

    let array = [];

    const libraries = this._forgeInstallLibraries;
    const processors = this._forgeInstallProcessors[1];

    array.push("-cp");
    array.push(this._getClassPath(processors.classpath, libraries, processors.jar));

    array.push("net.minecraftforge.jarsplitter.ConsoleTool");

    for (let i = 0; i < processors.args.length; i++) {

      let item = processors.args[i];
      let itemTwo = processors.args[i + 1];
      let val = null;

      switch (item) {
        case "--input":
          val = path.join(this._commonDirPath, "versions", this._minecraftVersion, `${this._minecraftVersion}.jar`);
          break;
        case "--slim":
          val = this._getInstallJsonData(itemTwo);
          break;
        case "--extra":
          val = this._getInstallJsonData(itemTwo);
          break;
        case "--srg":
          val = this._getInstallJsonData(itemTwo);
          break;
      }

      if (val !== null) {
        array.push(item);
        array.push(val);
      }
    }

    return array;
  }

  private _installerTools() {

    let array = [];

    const libraries = this._forgeInstallLibraries;
    const processors = this._forgeInstallProcessors[0];

    array.push("-cp");
    array.push(this._getClassPath(processors.classpath, libraries, processors.jar));

    array.push("net.minecraftforge.installertools.ConsoleTool");

    for (let i = 0; i < processors.args.length; i++) {

      let item = processors.args[i];
      let itemTwo = processors.args[i + 1];
      let val = null;

      switch (item) {
        case "--task":
          val = "MCP_DATA";
          break;
        case "--input":
          val = this._getRegroupPath(itemTwo, "");
          break;
        case "--output":
          val = this._getInstallJsonData(itemTwo);
          break;
        case "--key":
          val = "mappings";
          break;
      }

      if (val !== null) {
        array.push(item);
        array.push(val);
      }
    }

    return array;
  }

  private _getInstallJsonData(dataName: string) {

    const fsRemoveLeftFrame = dataName.split("{");
    const fsRemoveRightFrame = fsRemoveLeftFrame[1].split("}");

    const data = this._forgeInstallData[fsRemoveRightFrame[0]].client;

    return this._getRegroupPath(data, fsRemoveRightFrame[0]);
  }

  private _getRegroupPath(name: string, dataName: string): string | undefined {

    const fsRemoveLeftFrame = name.split("[");
    const fsRemoveRightFrame = fsRemoveLeftFrame[1].split("]");

    const fsSplit = fsRemoveRightFrame[0].split(":");
    const fsPointSplit = fsSplit[0].split(".");
    const fsMouseSplit = fsSplit[2].split("@");

    let filesPath;

    if (fsMouseSplit[1] === "zip") {

      filesPath = path.join(this._librariesDirPath, fsPointSplit.join(Utils.getOSType() === "windows" ? "\\" : "/"), fsSplit[1], fsMouseSplit[0], `${fsSplit[1]}-${fsMouseSplit[0]}.${fsMouseSplit[1]}`);

    } else {

      if (dataName === "MAPPINGS") {

        const fsMouseSplitTwo = fsSplit[3].split("@");
        filesPath = path.join(this._librariesDirPath, fsPointSplit.join(Utils.getOSType() === "windows" ? "\\" : "/"), fsSplit[1], fsMouseSplit[0], `${fsSplit[1]}-${fsSplit[2]}-${fsMouseSplitTwo[0]}.${fsMouseSplitTwo[1]}`);

      } else if (dataName === "MC_SLIM" || dataName === "MC_EXTRA" || dataName === "MC_SRG" || dataName === "PATCHED") {

        filesPath = path.join(this._librariesDirPath, fsPointSplit.join(Utils.getOSType() === "windows" ? "\\" : "/"), fsSplit[1], fsSplit[2], `${fsSplit[1]}-${fsSplit[2]}-${fsSplit[3]}.jar`);

      }
    }

    return filesPath;
  }

  private _getClassPath(InstallLibArray: Array<any>, libArray: Array<any>, InstallLibJar: string): string {

    let arrayJar = [InstallLibJar];
    arrayJar = arrayJar.concat(InstallLibArray);

    let array = [];

    for (let item of arrayJar) {
      array.push(this._matchinglibPath(item, libArray));
    }

    if (Utils.getOSType() === "windows") {
      return array.join(";");
    } else {
      return array.join(":");
    }
  }

  private _matchinglibPath(InstallLibName: string, libArray: Array<any>): string | undefined {
    for (let item of libArray) {
      if (item.name === InstallLibName) return item.download.filePath;
    }
    return undefined;
  }

  private _childBuild(array: any): Promise<void> {
    return new Promise((resolve) => {

      const childProcessors = childProcess.spawn("java", array);

      childProcessors.stdout.on("data", (data: any) => {
        // this._logger.info(iconv.decode(data, "utf8"));
      });

      childProcessors.stderr.on("data", (data: any) => {
        this._logger.error(iconv.decode(data, "utf8"));
      });

      childProcessors.on("close", (code: any) => {
        this._logger.info(`安裝 Forge > 安裝階段結束 code: ${code}`);
        return resolve();
      });
    });
  }
}
