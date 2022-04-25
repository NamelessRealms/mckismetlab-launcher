import * as fs from "fs-extra";
import * as path from "path";

import got from "got";

import Java from "../java/Java";
import IMojangAssetsReturn from "../../interfaces/IMojangAssetsReturn";
import IServerLauncherReturn from "../../interfaces/IServerLauncherReturn";
import Configs from "../../config/Configs";
import Downloader from "./Downloader";
import IModule from "../../interfaces/IModule";
import Utils from "./Utils";
import GlobalPath from "../io/GlobalPath";
import ForgeInstaller from "../modLoader/forge/ForgeInstaller";
import ProgressManager from "./ProgressManager";
import { ProgressTypeEnum } from "../../enums/ProgressTypeEnum";
import { ProcessStop } from "./ProcessStop";
import IModLoader from "../../interfaces/IModLoader";
import LoggerUtil from "./LoggerUtil";

export default class AssetsInstallerDownloader {

    private _logger: LoggerUtil = new LoggerUtil("AssetsInstallerDownloader");
    private _limit: number;
    private _serverAssetsObjects: IServerLauncherReturn;
    private _mojangAssetsGameJsonObjects: IMojangAssetsReturn;
    private _progressManager: ProgressManager;
    private _serverId: string;
    constructor(serverAssetsObjects: IServerLauncherReturn, mojangAssetsGameJsonObjects: IMojangAssetsReturn, progressManager: ProgressManager, serverId: string) {
        this._limit = Configs.assetsDownloadLimit;
        this._serverAssetsObjects = serverAssetsObjects;
        this._mojangAssetsGameJsonObjects = mojangAssetsGameJsonObjects;
        this._progressManager = progressManager;
        this._serverId = serverId;
    }

    public async validateData(): Promise<void> {

        this._logger.info(`Assets install download start.`);
        this._logger.info(`download limit: ${this._limit}, server id: ${this._serverId}`);

        const javaData = {
            version: this._serverAssetsObjects.javaVM.version,
            fileName: this._serverAssetsObjects.javaVM.download.fileName,
            downloadUrl: this._serverAssetsObjects.javaVM.download.url
        }
        // validate install java
        await new Java(this._progressManager).validateInstallJava(javaData);
        ProcessStop.isThrowProcessStopped(this._serverId);
        this._logger.info("Validate install java vm Done.");

        // validate install minecraft client version jar
        await this._installMinecraftClientJar();
        ProcessStop.isThrowProcessStopped(this._serverId);
        this._logger.info("Validate install minecraft client jar Done.");

        // validate install minecraft assets
        await this._installMinecraftAssets();
        this._logger.info("Validate install minecraft assets object hash Done.");

        // validate install minecraft libraries
        await this._installMinecraftLibraries();
        this._logger.info("Validate install minecraft libraries Done.");

        if (this._serverAssetsObjects.minecraftType === "minecraftModpack" || this._serverAssetsObjects.minecraftType === "minecraftModules") {

            if (this._serverAssetsObjects.modpack !== null && this._serverAssetsObjects.modpack.type === "FTB") {
                await this._installFtbModpackFile();
                this._logger.info("Validate install ftb modpack Done.");
            }

            // validate install modules
            await this._installModules();
            this._logger.info("Validate install modules Done.");
            // validate install modLoaders
            await this._modLoadersInstall();
            this._logger.info("Validate install modLoader Done.");
        }

        // flx log4j. download xml file
        await this._installLog4jXml();

        this._logger.info("Validate all assets install Done.");
    }

    private async _installLog4jXml(): Promise<void> {

        if(Utils.isMcVersion("1.17", this._serverAssetsObjects.minecraftVersion)) {
            return;
        }

        const log4jDirPath = path.join(GlobalPath.getCommonDirPath(), "log4j-xml");

        // 1.12 ~ 1.16.5
        const xml_112aboveUrl = "https://launcher.mojang.com/v1/objects/02937d122c86ce73319ef9975b58896fc1b491d1/log4j2_112-116.xml";
        // 1.7 ~ 1.11.2
        const xml_1111laterUrl = "https://launcher.mojang.com/v1/objects/4bb89a97a66f350bc9f73b3ca8509632682aea2e/log4j2_17-111.xml";

        let getUrl;

        if (Utils.isMcVersion("1.12", this._serverAssetsObjects.minecraftVersion)) {
            getUrl = xml_112aboveUrl;
        } else {
            getUrl = xml_1111laterUrl;
        }

        const log4jFilePath = path.join(log4jDirPath, Utils.urlLastName(getUrl) as string);
        const response = await got.get(getUrl);
        if (response.statusCode !== 200) throw new Error("Get 'log4j xml' fabric.");

        fs.ensureDirSync(log4jDirPath);
        fs.writeFileSync(log4jFilePath, response.body);
    }

    private async _installFtbModpackFile(): Promise<void> {
        if (this._serverAssetsObjects.modpack === null) throw new Error("serverAssetsObjects 'modpack' not null");
        if (this._serverAssetsObjects.modpack.files === undefined) throw new Error("serverAssetsObjects 'modpack files' not null");
        const files = this._serverAssetsObjects.modpack.files;
        await this._validateDataDownload(this._parsingFtbModpackFiles(files), ProgressTypeEnum.validateDownloadModpackFiles);
    }

    private _parsingFtbModpackFiles(files: Array<{ fileName: string, filePath: string, sha1: string, size: number, download: { url: string } }>): Array<{ fileName: string, filePath: string, sha1: string, size: number, download: { url: string } }> {

        let parsingFiles = new Array<{ fileName: string, filePath: string, sha1: string, size: number, download: { url: string } }>();

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

    private async _modLoadersInstall(): Promise<void> {

        if (this._serverAssetsObjects.modLoader === null) {
            throw new Error("serverAssetsObjects 'modLoaders' not null.");
        }

        if (this._serverAssetsObjects.modLoader.modLoaderType === "Forge") {
            await this._validateForgeInstall(this._serverAssetsObjects.modLoader);
        } else if (this._serverAssetsObjects.modLoader.modLoaderType === "Fabric") {
            await this._validateFabricInstall(this._serverAssetsObjects.modLoader);
        }
    }

    private async _validateFabricInstall(modLoader: IModLoader): Promise<void> {
        const libraries = this._getModLoadersLibraries(modLoader.startArguments.libraries);
        await this._validateDataDownload(libraries, ProgressTypeEnum.validateDownloadModLoader);
        this._logger.info("Validate install modLoader fabric libraries Done.");
    }

    private async _validateForgeInstall(modLoader: IModLoader): Promise<void> {

        const modLoaderForgeAssets = modLoader.forge;
        if (modLoaderForgeAssets === undefined) throw new Error("modLoaderForgeAssets not null.");

        if (Utils.isMcVersion("1.13", this._serverAssetsObjects.minecraftVersion) && modLoaderForgeAssets.isInstall) {

            if (modLoaderForgeAssets.installProfile === undefined) {
                throw new Error("modLoaderForgeAssets 'installProfile' not null.");
            }
            const installLibraries = modLoaderForgeAssets.installProfile.libraries;
            const libraries = this._getModLoadersLibraries(installLibraries);
            await this._validateDataDownload(libraries, ProgressTypeEnum.validateDownloadInstallProfileModLoader);
            this._logger.info("Validate install modLoader forge installLibraries Done.");

            await new ForgeInstaller(this._serverAssetsObjects.minecraftVersion, modLoaderForgeAssets.installProfile, this._progressManager).install();
            fs.removeSync(path.join(GlobalPath.getInstancesDirPath(), this._serverId, ".TEMP", "ForgeModLoader"));
        }

        const libraries = this._getModLoadersLibraries(modLoader.startArguments.libraries);
        await this._validateDataDownload(libraries, ProgressTypeEnum.validateDownloadModLoader);
        this._logger.info("Validate install modLoader forge libraries Done.");
    }

    private _getModLoadersLibraries(libraries: Array<{ name: string; download: { fileName: string; filePath: string; sha1: string; size: number; download: { url: string; } } }>): Array<{ fileName: string, filePath: string, sha1: string, size: number, download: { url: string } }> {

        let librariesData = new Array<{ fileName: string, filePath: string, sha1: string, size: number, download: { url: string } }>();

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

    private async _installMinecraftLibraries(): Promise<void> {
        const libraries = this._mojangAssetsGameJsonObjects.libraries;
        await this._validateDataDownload(libraries, ProgressTypeEnum.validateDownloadLibraries);
    }

    private async _installMinecraftAssets(): Promise<void> {
        const objects = this._mojangAssetsGameJsonObjects.assetsObjects.objects;
        await this._validateDataDownload(objects, ProgressTypeEnum.validateDownloadMinecraftAssets);
    }

    private async _installModules(): Promise<void> {
        if (this._serverAssetsObjects.module === null) return;
        const modules = this._serverAssetsObjects.module.modules.filter((module) => !module.userRevert);
        const parsingModules = this._parsingModules(modules);
        await this._validateDataDownload(parsingModules, ProgressTypeEnum.validateDownloadModules);
    }

    private _parsingModules(modules: Array<IModule>): Array<{ fileName: string, filePath: string, sha1: string, size: number, download: { url: string } }> {

        let parsingModules = new Array<{ fileName: string, filePath: string, sha1: string, size: number, download: { url: string } }>();

        for (let module of modules) {
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

    private async _installMinecraftClientJar(): Promise<void> {

        const clientJar = this._mojangAssetsGameJsonObjects.client;
        const clientJarFilePath = this._mojangAssetsGameJsonObjects.client.filePath;

        if (!fs.existsSync(clientJarFilePath)) {
            await Downloader.download(clientJar.download.url, clientJar.filePath, (percent) => this._progressManager.set(ProgressTypeEnum.validateDownloadGameClientJar, percent));
        }
    }

    private async _validateDataDownload(assets: Array<{ fileName: string, filePath: string, sha1: string, size: number, download: { url: string } }>, progressTypeEnum?: ProgressTypeEnum): Promise<void> {

        let downloadQueue = new Array();

        for (let i = 0; i < assets.length; i++) {

            const asset = assets[i];
            const filePath = asset.filePath;
            const url = asset.download.url;

            const promiseDownload = async (): Promise<void> => {
                if (progressTypeEnum !== undefined) {
                    this._progressManager.set(progressTypeEnum, i, assets.length - 1);
                }
                if (!fs.existsSync(filePath)) {
                    await Downloader.download(url, filePath);
                }
            }

            downloadQueue.push(promiseDownload());
            // stop
            ProcessStop.isThrowProcessStopped(this._serverId);

            if (downloadQueue.length >= this._limit || i + 1 >= assets.length) {
                await Promise.all(downloadQueue);
                downloadQueue = new Array();
            }
        }
    }
}