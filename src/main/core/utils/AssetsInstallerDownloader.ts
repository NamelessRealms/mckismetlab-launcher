import * as fs from "fs-extra";
import * as path from "path";

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

export default class AssetsInstallerDownloader {

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

        const javaData = {
            version: this._serverAssetsObjects.javaVM.version,
            fileName: this._serverAssetsObjects.javaVM.download.fileName,
            downloadUrl: this._serverAssetsObjects.javaVM.download.url
        }
        // validate install java
        await new Java(this._progressManager).validateInstallJava(javaData);
        ProcessStop.isThrowProcessStopped(this._serverId);

        // validate install minecraft client version jar
        await this._installMinecraftClientJar();
        ProcessStop.isThrowProcessStopped(this._serverId);

        // validate install minecraft assets
        await this._installMinecraftAssets();

        // validate install minecraft libraries
        await this._installMinecraftLibraries();

        if (this._serverAssetsObjects.minecraftType === "minecraftModpack" || this._serverAssetsObjects.minecraftType === "minecraftModules") {

            if(this._serverAssetsObjects.modpack !== null && this._serverAssetsObjects.modpack.type === "FTB") {
                await this._installFtbModpackFile();
            }

            // validate install modules
            await this._installModules();
            // validate install modLoaders
            await this._modLoadersInstall();
        }

        console.log("Validate assets download Done.");
    }

    private async _installFtbModpackFile(): Promise<void> {
        if(this._serverAssetsObjects.modpack === null) throw new Error("serverAssetsObjects 'modpack' not null");
        if(this._serverAssetsObjects.modpack.ftb === undefined) throw new Error("serverAssetsObjects 'modpack ftb' not null");
        const files = this._serverAssetsObjects.modpack.ftb.files;
        await this._validateDataDownload(this._parsingFtbModpackFiles(files), ProgressTypeEnum.validateDownloadModLoader);
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

            await new ForgeInstaller(this._serverAssetsObjects.minecraftVersion, modLoaderForgeAssets.installProfile, this._progressManager).install();
            fs.removeSync(path.join(GlobalPath.getInstancesDirPath(), this._serverId, ".TEMP", "ForgeModLoader"));
        }

        const libraries = this._getModLoadersLibraries(modLoader.startArguments.libraries);
        await this._validateDataDownload(libraries, ProgressTypeEnum.validateDownloadModLoader);
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
        await this._validateDataDownload(this._parsingModules(this._serverAssetsObjects.module.modules), ProgressTypeEnum.validateDownloadModules);
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