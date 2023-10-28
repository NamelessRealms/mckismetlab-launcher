"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = require("path");
const childProcess = require("child_process");
const GlobalPath_1 = require("../../io/GlobalPath");
const Utils_1 = require("../../utils/Utils");
const ProgressTypeEnum_1 = require("../../../enums/ProgressTypeEnum");
const LoggerUtil_1 = require("../../utils/LoggerUtil");
class ForgeInstaller {
    constructor(minecraftVersion, forgeInstallProfile, progressManager) {
        this._logger = new LoggerUtil_1.default("ForgeInstaller");
        this._minecraftVersion = minecraftVersion;
        this._forgeInstallLibraries = forgeInstallProfile.libraries;
        this._forgeInstallProcessors = forgeInstallProfile.processors;
        this._forgeInstallData = forgeInstallProfile.data;
        this._librariesDirPath = path.join(GlobalPath_1.default.getCommonDirPath(), "libraries");
        this._commonDirPath = GlobalPath_1.default.getCommonDirPath();
        this._clientLzmaPath = forgeInstallProfile.clientLzmaPath;
        this._progressManager = progressManager;
    }
    install() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this._logger.info("安裝 Forge 第一階段開始");
            this._progressManager.set(ProgressTypeEnum_1.ProgressTypeEnum.validateInstallModLoader, 1, 5);
            const installerTools = this._installerTools();
            yield this._childBuild(installerTools);
            this._logger.info("安裝 Forge 第二階段開始");
            this._progressManager.set(ProgressTypeEnum_1.ProgressTypeEnum.validateInstallModLoader, 2, 5);
            const jarsplitter = this._jarsplitter();
            yield this._childBuild(jarsplitter);
            this._logger.info("安裝 Forge 第三階段開始");
            this._progressManager.set(ProgressTypeEnum_1.ProgressTypeEnum.validateInstallModLoader, 3, 5);
            const specialSource = this._specialSource();
            yield this._childBuild(specialSource);
            this._logger.info("安裝 Forge 第四階段開始");
            this._progressManager.set(ProgressTypeEnum_1.ProgressTypeEnum.validateInstallModLoader, 4, 5);
            const binarypatcher = this._binarypatcher();
            yield this._childBuild(binarypatcher);
            this._progressManager.set(ProgressTypeEnum_1.ProgressTypeEnum.validateInstallModLoader, 5, 5);
        });
    }
    _binarypatcher() {
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
    _specialSource() {
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
    _jarsplitter() {
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
    _installerTools() {
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
    _getInstallJsonData(dataName) {
        const fsRemoveLeftFrame = dataName.split("{");
        const fsRemoveRightFrame = fsRemoveLeftFrame[1].split("}");
        const data = this._forgeInstallData[fsRemoveRightFrame[0]].client;
        return this._getRegroupPath(data, fsRemoveRightFrame[0]);
    }
    _getRegroupPath(name, dataName) {
        const fsRemoveLeftFrame = name.split("[");
        const fsRemoveRightFrame = fsRemoveLeftFrame[1].split("]");
        const fsSplit = fsRemoveRightFrame[0].split(":");
        const fsPointSplit = fsSplit[0].split(".");
        const fsMouseSplit = fsSplit[2].split("@");
        let filesPath;
        if (fsMouseSplit[1] === "zip") {
            filesPath = path.join(this._librariesDirPath, fsPointSplit.join(Utils_1.default.getOSType() === "windows" ? "\\" : "/"), fsSplit[1], fsMouseSplit[0], `${fsSplit[1]}-${fsMouseSplit[0]}.${fsMouseSplit[1]}`);
        }
        else {
            if (dataName === "MAPPINGS") {
                const fsMouseSplitTwo = fsSplit[3].split("@");
                filesPath = path.join(this._librariesDirPath, fsPointSplit.join(Utils_1.default.getOSType() === "windows" ? "\\" : "/"), fsSplit[1], fsMouseSplit[0], `${fsSplit[1]}-${fsSplit[2]}-${fsMouseSplitTwo[0]}.${fsMouseSplitTwo[1]}`);
            }
            else if (dataName === "MC_SLIM" || dataName === "MC_EXTRA" || dataName === "MC_SRG" || dataName === "PATCHED") {
                filesPath = path.join(this._librariesDirPath, fsPointSplit.join(Utils_1.default.getOSType() === "windows" ? "\\" : "/"), fsSplit[1], fsSplit[2], `${fsSplit[1]}-${fsSplit[2]}-${fsSplit[3]}.jar`);
            }
        }
        return filesPath;
    }
    _getClassPath(InstallLibArray, libArray, InstallLibJar) {
        let arrayJar = [InstallLibJar];
        arrayJar = arrayJar.concat(InstallLibArray);
        let array = [];
        for (let item of arrayJar) {
            array.push(this._matchinglibPath(item, libArray));
        }
        if (Utils_1.default.getOSType() === "windows") {
            return array.join(";");
        }
        else {
            return array.join(":");
        }
    }
    _matchinglibPath(InstallLibName, libArray) {
        for (let item of libArray) {
            if (item.name === InstallLibName)
                return item.download.filePath;
        }
        return undefined;
    }
    _childBuild(array) {
        return new Promise((resolve) => {
            const childProcessors = childProcess.spawn("java", array);
            childProcessors.stdout.setEncoding("utf8");
            childProcessors.stderr.setEncoding("utf8");
            childProcessors.stdout.on("data", (data) => {
                // console.log(data);
            });
            childProcessors.stderr.on("data", (data) => {
                this._logger.error(data);
            });
            childProcessors.on("close", (code) => {
                this._logger.info(`安裝 Forge > 安裝階段結束 code: ${code}`);
                return resolve();
            });
        });
    }
}
exports.default = ForgeInstaller;
//# sourceMappingURL=ForgeInstaller.js.map