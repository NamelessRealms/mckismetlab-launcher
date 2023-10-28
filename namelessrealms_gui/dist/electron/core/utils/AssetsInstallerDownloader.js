"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = require("fs-extra");
const path = require("path");
const got_1 = require("got");
const Java_1 = require("../java/Java");
const Configs_1 = require("../../config/Configs");
const Downloader_1 = require("./Downloader");
const Utils_1 = require("./Utils");
const GlobalPath_1 = require("../io/GlobalPath");
const ForgeInstaller_1 = require("../modLoader/forge/ForgeInstaller");
const ProgressTypeEnum_1 = require("../../enums/ProgressTypeEnum");
const ProcessStop_1 = require("./ProcessStop");
const LoggerUtil_1 = require("./LoggerUtil");
class AssetsInstallerDownloader {
    constructor(serverAssetsObjects, mojangAssetsGameJsonObjects, progressManager, serverId) {
        this._logger = new LoggerUtil_1.default("AssetsInstallerDownloader");
        this._limit = Configs_1.default.assetsDownloadLimit;
        this._serverAssetsObjects = serverAssetsObjects;
        this._mojangAssetsGameJsonObjects = mojangAssetsGameJsonObjects;
        this._progressManager = progressManager;
        this._serverId = serverId;
    }
    validateData() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this._logger.info(`Assets install download start.`);
            this._logger.info(`download limit: ${this._limit}, server id: ${this._serverId}`);
            const javaData = {
                version: this._serverAssetsObjects.javaVM.version,
                fileName: this._serverAssetsObjects.javaVM.download.fileName,
                downloadUrl: this._serverAssetsObjects.javaVM.download.url
            };
            // validate install java
            yield new Java_1.default(this._progressManager).validateInstallJava(javaData);
            ProcessStop_1.ProcessStop.isThrowProcessStopped(this._serverId);
            this._logger.info("Validate install java vm Done.");
            // validate install minecraft client version jar
            yield this._installMinecraftClientJar();
            ProcessStop_1.ProcessStop.isThrowProcessStopped(this._serverId);
            this._logger.info("Validate install minecraft client jar Done.");
            // validate install minecraft assets
            yield this._installMinecraftAssets();
            this._logger.info("Validate install minecraft assets object hash Done.");
            // validate install minecraft libraries
            yield this._installMinecraftLibraries();
            this._logger.info("Validate install minecraft libraries Done.");
            if (this._serverAssetsObjects.minecraftType === "minecraftModpack" || this._serverAssetsObjects.minecraftType === "minecraftModules") {
                if (this._serverAssetsObjects.modpack !== null && this._serverAssetsObjects.modpack.type === "FTB") {
                    yield this._installFtbModpackFile();
                    this._logger.info("Validate install ftb modpack Done.");
                }
                // validate install modules
                yield this._installModules();
                this._logger.info("Validate install modules Done.");
                // validate install modLoaders
                yield this._modLoadersInstall();
                this._logger.info("Validate install modLoader Done.");
            }
            // flx log4j. download xml file
            yield this._installLog4jXml();
            this._logger.info("Validate all assets install Done.");
        });
    }
    _installLog4jXml() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (Utils_1.default.isMcVersion("1.17", this._serverAssetsObjects.minecraftVersion)) {
                return;
            }
            const log4jDirPath = path.join(GlobalPath_1.default.getCommonDirPath(), "log4j-xml");
            // 1.12 ~ 1.16.5
            const xml_112aboveUrl = "https://launcher.mojang.com/v1/objects/02937d122c86ce73319ef9975b58896fc1b491d1/log4j2_112-116.xml";
            // 1.7 ~ 1.11.2
            const xml_1111laterUrl = "https://launcher.mojang.com/v1/objects/4bb89a97a66f350bc9f73b3ca8509632682aea2e/log4j2_17-111.xml";
            let getUrl;
            if (Utils_1.default.isMcVersion("1.12", this._serverAssetsObjects.minecraftVersion)) {
                getUrl = xml_112aboveUrl;
            }
            else {
                getUrl = xml_1111laterUrl;
            }
            const log4jFilePath = path.join(log4jDirPath, Utils_1.default.urlLastName(getUrl));
            const response = yield got_1.default.get(getUrl);
            if (response.statusCode !== 200)
                throw new Error("Get 'log4j xml' fabric.");
            fs.ensureDirSync(log4jDirPath);
            fs.writeFileSync(log4jFilePath, response.body);
        });
    }
    _installFtbModpackFile() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this._serverAssetsObjects.modpack === null)
                throw new Error("serverAssetsObjects 'modpack' not null");
            if (this._serverAssetsObjects.modpack.files === undefined)
                throw new Error("serverAssetsObjects 'modpack files' not null");
            const files = this._serverAssetsObjects.modpack.files;
            yield this._validateDataDownload(this._parsingFtbModpackFiles(files), ProgressTypeEnum_1.ProgressTypeEnum.validateDownloadModpackFiles);
        });
    }
    _parsingFtbModpackFiles(files) {
        let parsingFiles = new Array();
        for (let file of files) {
            parsingFiles.push({
                fileName: file.fileName,
                filePath: file.filePath,
                sha1: file.sha1,
                size: file.size,
                download: {
                    url: file.download.url
                }
            });
        }
        return parsingFiles;
    }
    _modLoadersInstall() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this._serverAssetsObjects.modLoader === null) {
                throw new Error("serverAssetsObjects 'modLoaders' not null.");
            }
            if (this._serverAssetsObjects.modLoader.modLoaderType === "Forge") {
                yield this._validateForgeInstall(this._serverAssetsObjects.modLoader);
            }
            else if (this._serverAssetsObjects.modLoader.modLoaderType === "Fabric") {
                yield this._validateFabricInstall(this._serverAssetsObjects.modLoader);
            }
        });
    }
    _validateFabricInstall(modLoader) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const libraries = this._getModLoadersLibraries(modLoader.startArguments.libraries);
            yield this._validateDataDownload(libraries, ProgressTypeEnum_1.ProgressTypeEnum.validateDownloadModLoader);
            this._logger.info("Validate install modLoader fabric libraries Done.");
        });
    }
    _validateForgeInstall(modLoader) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const modLoaderForgeAssets = modLoader.forge;
            if (modLoaderForgeAssets === undefined)
                throw new Error("modLoaderForgeAssets not null.");
            if (Utils_1.default.isMcVersion("1.13", this._serverAssetsObjects.minecraftVersion) && modLoaderForgeAssets.isInstall) {
                if (modLoaderForgeAssets.installProfile === undefined) {
                    throw new Error("modLoaderForgeAssets 'installProfile' not null.");
                }
                const installLibraries = modLoaderForgeAssets.installProfile.libraries;
                const libraries = this._getModLoadersLibraries(installLibraries);
                yield this._validateDataDownload(libraries, ProgressTypeEnum_1.ProgressTypeEnum.validateDownloadInstallProfileModLoader);
                this._logger.info("Validate install modLoader forge installLibraries Done.");
                yield new ForgeInstaller_1.default(this._serverAssetsObjects.minecraftVersion, modLoaderForgeAssets.installProfile, this._progressManager).install();
                fs.removeSync(path.join(GlobalPath_1.default.getInstancesDirPath(), this._serverId, ".TEMP", "ForgeModLoader"));
            }
            const libraries = this._getModLoadersLibraries(modLoader.startArguments.libraries);
            yield this._validateDataDownload(libraries, ProgressTypeEnum_1.ProgressTypeEnum.validateDownloadModLoader);
            this._logger.info("Validate install modLoader forge libraries Done.");
        });
    }
    _getModLoadersLibraries(libraries) {
        let librariesData = new Array();
        for (let lib of libraries) {
            librariesData.push({
                fileName: lib.download.fileName,
                filePath: lib.download.filePath,
                sha1: lib.download.sha1,
                size: lib.download.size,
                download: {
                    url: lib.download.download.url
                }
            });
        }
        return librariesData;
    }
    _installMinecraftLibraries() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const libraries = this._mojangAssetsGameJsonObjects.libraries;
            yield this._validateDataDownload(libraries, ProgressTypeEnum_1.ProgressTypeEnum.validateDownloadLibraries);
        });
    }
    _installMinecraftAssets() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const objects = this._mojangAssetsGameJsonObjects.assetsObjects.objects;
            yield this._validateDataDownload(objects, ProgressTypeEnum_1.ProgressTypeEnum.validateDownloadMinecraftAssets);
        });
    }
    _installModules() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this._serverAssetsObjects.module === null)
                return;
            const modules = this._serverAssetsObjects.module.modules.filter((module) => !module.userRevert);
            const parsingModules = this._parsingModules(modules);
            yield this._validateDataDownload(parsingModules, ProgressTypeEnum_1.ProgressTypeEnum.validateDownloadModules);
        });
    }
    _parsingModules(modules) {
        let parsingModules = new Array();
        for (let module of modules) {
            // Flx curseforge api downloadUrl null issues
            if (module.download.url === null) {
                this._logger.warn(module.fileName);
                module.download.url = Utils_1.default.flxCurseforgeDownloadUrlNullIssues(module.fileId, module.fileName);
            }
            parsingModules.push({
                fileName: module.fileName,
                filePath: module.filePath,
                sha1: "",
                size: 0,
                download: {
                    url: module.download.url
                }
            });
        }
        return parsingModules;
    }
    _installMinecraftClientJar() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const clientJar = this._mojangAssetsGameJsonObjects.client;
            const clientJarFilePath = this._mojangAssetsGameJsonObjects.client.filePath;
            if (!fs.existsSync(clientJarFilePath)) {
                yield Downloader_1.default.download(clientJar.download.url, clientJar.filePath, (percent) => this._progressManager.set(ProgressTypeEnum_1.ProgressTypeEnum.validateDownloadGameClientJar, percent));
            }
        });
    }
    _validateDataDownload(assets, progressTypeEnum) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let downloadQueue = new Array();
            for (let i = 0; i < assets.length; i++) {
                const asset = assets[i];
                const filePath = asset.filePath;
                const url = asset.download.url;
                const promiseDownload = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    if (progressTypeEnum !== undefined) {
                        this._progressManager.set(progressTypeEnum, i, assets.length - 1);
                    }
                    if (!fs.existsSync(filePath)) {
                        yield Downloader_1.default.download(url, filePath);
                    }
                });
                downloadQueue.push(promiseDownload());
                // stop
                ProcessStop_1.ProcessStop.isThrowProcessStopped(this._serverId);
                if (downloadQueue.length >= this._limit || i + 1 >= assets.length) {
                    yield Promise.all(downloadQueue);
                    downloadQueue = new Array();
                }
            }
        });
    }
}
exports.default = AssetsInstallerDownloader;
//# sourceMappingURL=AssetsInstallerDownloader.js.map