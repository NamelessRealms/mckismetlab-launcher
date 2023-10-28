"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = require("path");
const fs = require("fs-extra");
const GlobalPath_1 = require("../../io/GlobalPath");
const Utils_1 = require("../../utils/Utils");
const Downloader_1 = require("../../utils/Downloader");
const ForgeInstallProfileParser_1 = require("../../parser/ForgeInstallProfileParser");
const ProgressTypeEnum_1 = require("../../../enums/ProgressTypeEnum");
const ForgeVersionJsonParser_1 = require("../../parser/ForgeVersionJsonParser");
const LoggerUtil_1 = require("../../utils/LoggerUtil");
class ForgeHandler {
    constructor(serverId, mojangVersion, forgeId, progressManager) {
        this._logger = new LoggerUtil_1.default("ForgeHandler");
        this._commandDirPath = GlobalPath_1.default.getCommonDirPath();
        this._tempDirPath = path.join(GlobalPath_1.default.getInstancesDirPath(), serverId, ".TEMP");
        this._mojangVersion = mojangVersion;
        this._forgeId = forgeId;
        this._progressManager = progressManager;
    }
    forgeHandlerParser() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const tempForgeDirPath = path.join(this._tempDirPath, "ForgeModLoader");
            const forgeVersionJsonObjectPath = path.join(this._commandDirPath, "versions", this._getForgeVersion(), `${this._getForgeVersion()}.json`);
            this._logger.info(`temp forge dir path: ${tempForgeDirPath}`);
            const validateForgeJar = this._validateForgeJar();
            this._logger.info(`validate forge jar -> ${validateForgeJar}`);
            if (validateForgeJar) {
                const forgeInstallProfile = yield this._doForgeParser(tempForgeDirPath, forgeVersionJsonObjectPath, this._getForgeDownloadUrl());
                this._logger.info(`讀取檔案 Path: ${forgeVersionJsonObjectPath}`);
                const forgeVersionJsonObject = fs.readJSONSync(forgeVersionJsonObjectPath);
                this._logger.info(`成功讀取檔案 Path: ${forgeVersionJsonObjectPath}`);
                const forgeVersionJsonParser = new ForgeVersionJsonParser_1.default(forgeVersionJsonObject, this._mojangVersion);
                return {
                    isInstall: true,
                    versionJsonObject: forgeVersionJsonObject,
                    installProfile: forgeInstallProfile,
                    version: this._getForgeVersion(),
                    arguments: forgeVersionJsonParser.minecraftArguments,
                    mainClass: forgeVersionJsonParser.mainClass,
                    libraries: this._parsingModLoadersLibraries(forgeVersionJsonParser.libraries)
                };
            }
            else {
                this._logger.info(`讀取檔案 Path: ${forgeVersionJsonObjectPath}`);
                const forgeVersionJsonObject = fs.readJSONSync(forgeVersionJsonObjectPath);
                this._logger.info(`成功讀取檔案 Path: ${forgeVersionJsonObjectPath}`);
                const forgeVersionJsonParser = new ForgeVersionJsonParser_1.default(forgeVersionJsonObject, this._mojangVersion);
                return {
                    isInstall: false,
                    versionJsonObject: forgeVersionJsonObject,
                    version: this._getForgeVersion(),
                    arguments: forgeVersionJsonParser.minecraftArguments,
                    mainClass: forgeVersionJsonParser.mainClass,
                    libraries: this._parsingModLoadersLibraries(forgeVersionJsonParser.libraries)
                };
            }
        });
    }
    _doForgeParser(tempForgeDirPath, forgeVersionJsonObjectPath, forgeDownloadUrl) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const gameLibrariesDirPath = path.join(this._commandDirPath, "libraries");
            const tempForgeFileNamePath = path.join(tempForgeDirPath, Utils_1.default.urlLastName(forgeDownloadUrl));
            const tempForgeMavenDirPath = path.join(tempForgeDirPath, "maven");
            const tempForgeVersionJsonPath = path.join(tempForgeDirPath, "version.json");
            // download modLoaders file
            yield Downloader_1.default.download(forgeDownloadUrl, tempForgeFileNamePath, (percent) => { if (this._progressManager !== undefined) {
                this._progressManager.set(ProgressTypeEnum_1.ProgressTypeEnum.getModLoaderData, percent);
            } }, { rejectUnauthorized: false });
            // unFile modLoaders file
            yield Utils_1.default.unZipFile(tempForgeFileNamePath, tempForgeDirPath);
            const forgeInstallProfileJsonObject = this._getInstallProfileObjJson(tempForgeDirPath);
            const forgeInstallProfileParser = new ForgeInstallProfileParser_1.default(forgeInstallProfileJsonObject);
            // copy modLoaders jar file
            this._copyForgeMavenJarDir(tempForgeMavenDirPath, gameLibrariesDirPath);
            // copy version jar file
            this._copyForgeVersionJsonFile(tempForgeVersionJsonPath, forgeVersionJsonObjectPath);
            // handler client.lzma
            if (Utils_1.default.isMcVersion("1.13", this._mojangVersion)) {
                const tempClientLzmaFilePath = path.join(tempForgeDirPath, "data", "client.lzma");
                return {
                    data: forgeInstallProfileParser.data,
                    libraries: this._parsingModLoadersLibraries(forgeInstallProfileParser.libraries),
                    processors: forgeInstallProfileParser.processors,
                    clientLzmaPath: tempClientLzmaFilePath
                };
            }
            return undefined;
        });
    }
    _parsingModLoadersLibraries(libraries) {
        let librariesData = new Array();
        for (let lib of libraries) {
            if (lib.downloads.artifact.url.length !== 0) {
                librariesData.push({
                    name: lib.name,
                    download: {
                        fileName: Utils_1.default.urlLastName(lib.downloads.artifact.path),
                        filePath: path.join(path.join(GlobalPath_1.default.getCommonDirPath(), "libraries"), lib.downloads.artifact.path),
                        sha1: lib.downloads.artifact.sha1,
                        size: lib.downloads.artifact.size,
                        download: {
                            url: lib.downloads.artifact.url
                        }
                    }
                });
            }
        }
        return librariesData;
    }
    _getInstallProfileObjJson(tempForgeDirPath) {
        const versionInstallProfileObjFilePath = path.join(GlobalPath_1.default.getCommonDirPath(), "versions", this._getForgeVersion(), `${this._getForgeVersion()}_install_profile.json`);
        this._logger.info(`Get forge install profile json file data. path: ${versionInstallProfileObjFilePath}`);
        let forgeInstallProfileJsonObject;
        const isExists = fs.existsSync(versionInstallProfileObjFilePath);
        this._logger.info(`是否有檔案 -> ${isExists}`);
        if (isExists) {
            this._logger.info(`讀取檔案 Path: ${versionInstallProfileObjFilePath}`);
            forgeInstallProfileJsonObject = fs.readJSONSync(versionInstallProfileObjFilePath);
            this._logger.info(`成功讀取檔案 Path: ${versionInstallProfileObjFilePath}`);
        }
        else {
            if (tempForgeDirPath === undefined)
                throw new Error("tempForgeDirPath not undefined.");
            const tempForgeInstallProfileJsonPath = path.join(tempForgeDirPath, "install_profile.json");
            this._logger.info(`讀取檔案 Temp path: ${tempForgeInstallProfileJsonPath}`);
            forgeInstallProfileJsonObject = fs.readJSONSync(tempForgeInstallProfileJsonPath);
            this._logger.info(`成功讀取檔案 Temp path: ${tempForgeInstallProfileJsonPath}`);
            fs.ensureDirSync(path.join(versionInstallProfileObjFilePath, ".."));
            this._logger.info(`寫入檔案 Temp path: ${tempForgeInstallProfileJsonPath}`);
            fs.writeFileSync(versionInstallProfileObjFilePath, JSON.stringify(forgeInstallProfileJsonObject), "utf8");
            this._logger.info(`成功寫入檔案 Temp path: ${tempForgeInstallProfileJsonPath}`);
        }
        return forgeInstallProfileJsonObject;
    }
    _copyForgeVersionJsonFile(filePath, targetFilePath) {
        this._logger.info(`Copy forge version json file path: ${filePath} -> ${targetFilePath}`);
        fs.ensureDirSync(path.join(targetFilePath, ".."));
        fs.copySync(filePath, targetFilePath);
        this._logger.info(`Complete copy forge version json file path: ${filePath} -> ${targetFilePath}`);
    }
    _copyForgeMavenJarDir(dirPath, targetDirPath) {
        this._logger.info(`Copy forge maven jar dir path: ${dirPath} -> ${targetDirPath}`);
        fs.ensureDirSync(targetDirPath);
        fs.copySync(dirPath, targetDirPath);
        this._logger.info(`Complete copy forge maven jar dir path: ${dirPath} -> ${targetDirPath}`);
    }
    _validateForgeJar() {
        const gameLibrariesDirPath = path.join(this._commandDirPath, "libraries");
        // ["forge", "36.2.8"]
        const forgeVersionSplit = this._forgeId.split("-");
        // const mojangVersion = forgeVersionSplit[0];
        const mojangVersion = this._mojangVersion;
        const forgeMinorVersion = forgeVersionSplit[1];
        const necessaryFiles = new Array();
        if (Utils_1.default.isMcVersion("1.13", mojangVersion)) {
            necessaryFiles.push(`net/minecraftforge/forge/${mojangVersion}-${forgeMinorVersion}/forge-${mojangVersion}-${forgeMinorVersion}-client.jar`);
        }
        else {
            necessaryFiles.push(`net/minecraftforge/forge/${mojangVersion}-${forgeMinorVersion}/forge-${mojangVersion}-${forgeMinorVersion}.jar`);
        }
        for (let necessaryFile of necessaryFiles) {
            if (!fs.existsSync(path.join(gameLibrariesDirPath, necessaryFile)))
                return true;
        }
        return false;
    }
    _getForgeDownloadUrl() {
        // https://maven.minecraftforge.net/net/minecraftforge/forge/1.18.1-39.0.76/forge-1.18.1-39.0.76-installer.jar
        // https://maven.minecraftforge.net/net/minecraftforge/forge/1.12.2-14.23.5.2860/forge-1.12.2-14.23.5.2860-installer.jar
        const forgeIdSplit = this._forgeId.split("-");
        return `https://maven.minecraftforge.net/net/minecraftforge/forge/${this._mojangVersion}-${forgeIdSplit[1]}/${forgeIdSplit[0]}-${this._mojangVersion}-${forgeIdSplit[1]}-installer.jar`;
    }
    _getForgeVersion() {
        return `${this._mojangVersion}-${this._forgeId.split("-")[1]}`;
    }
    removeForgeDataHandler() {
        const modLoadersVersionDirPath = path.join(GlobalPath_1.default.getCommonDirPath(), "versions", this._getForgeVersion());
        const forgeVersionJsonObjectPath = path.join(this._commandDirPath, "versions", this._getForgeVersion(), `${this._getForgeVersion()}.json`);
        const forgeVersionJsonObject = fs.readJSONSync(forgeVersionJsonObjectPath);
        const forgeVersionJsonParser = new ForgeVersionJsonParser_1.default(forgeVersionJsonObject, this._mojangVersion);
        for (let forgeLib of forgeVersionJsonParser.libraries) {
            const filePath = path.join(path.join(GlobalPath_1.default.getCommonDirPath(), "libraries"), forgeLib.downloads.artifact.path);
            if (fs.existsSync(filePath))
                fs.removeSync(filePath);
        }
        if (Utils_1.default.isMcVersion("1.13", this._mojangVersion)) {
            const forgeInstallProfileJsonObject = this._getInstallProfileObjJson();
            const forgeInstallProfileParser = new ForgeInstallProfileParser_1.default(forgeInstallProfileJsonObject);
            for (let forgeInstallProfileLib of forgeInstallProfileParser.libraries) {
                const filePath = path.join(path.join(GlobalPath_1.default.getCommonDirPath(), "libraries"), forgeInstallProfileLib.downloads.artifact.path);
                if (fs.existsSync(filePath))
                    fs.removeSync(filePath);
            }
        }
        if (fs.existsSync(modLoadersVersionDirPath))
            fs.removeSync(modLoadersVersionDirPath);
    }
}
exports.default = ForgeHandler;
//# sourceMappingURL=ForgeHandler.js.map