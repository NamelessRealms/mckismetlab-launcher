import * as fs from "fs-extra";
import * as path from "path";

import Java from "../java/Java";
import IMojangAssetsReturn from "../../interfaces/IMojangAssetsReturn";
import IServerLauncherReturn from "../../interfaces/IServerLauncherReturn";
import Configs from "../../config/Configs";
import Downloader from "./Downloader";
import IModule from "../../interfaces/IModule";
import ForgeVersionJsonParser from "../parser/ForgeVersionJsonParser";
import Utils from "./Utils";
import IForgeVersionLibraries from "../../interfaces/IForgeVersionLibraries";
import GlobalPath from "../io/GlobalPath";
import ForgeInstaller from "../modLoaders/forge/ForgeInstaller";
import ProgressManager from "./ProgressManager";
import { ProgressTypeEnum } from "../../enums/ProgressTypeEnum";
import { ProcessStop } from "./ProcessStop";

export default class AssetsInstallerDownloader {

    private _limit: number;
    private _serverLauncherJsonObjects: IServerLauncherReturn;
    private _mojangAssetsGameJsonObjects: IMojangAssetsReturn;
    private _progressManager: ProgressManager;
    private _serverId: string;
    constructor(serverLauncherJsonObjects: IServerLauncherReturn, mojangAssetsGameJsonObjects: IMojangAssetsReturn, progressManager: ProgressManager, serverId: string) {
        this._limit = Configs.assetsDownloadLimit;
        this._serverLauncherJsonObjects = serverLauncherJsonObjects;
        this._mojangAssetsGameJsonObjects = mojangAssetsGameJsonObjects;
        this._progressManager = progressManager;
        this._serverId = serverId;
    }

    public async validateData(): Promise<void> {

        const javaData = {
            version: this._serverLauncherJsonObjects.java.version,
            fileName: this._serverLauncherJsonObjects.java.download.fileName,
            downloadUrl: this._serverLauncherJsonObjects.java.download.url
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

        if (this._serverLauncherJsonObjects.minecraftType === "minecraftModpack" || this._serverLauncherJsonObjects.minecraftType === "minecraftModules") {
            // validate install modules
            await this._installModules();
            // validate install modLoaders
            await this._modLoadersInstall();
        }

        console.log("Assets download Done.");
    }

    private _modLoadersInstall(): Promise<void> {
        return new Promise(async (resolve, reject) => {

            if (this._serverLauncherJsonObjects.modLoaders === undefined) {
                return reject("Undefined this._serverLauncherJsonObjects modLoaders.");
            }

            const minecraftVersion = this._serverLauncherJsonObjects.minecraftVersion;
            const forgeVersionJsonParser = new ForgeVersionJsonParser(this._serverLauncherJsonObjects.modLoaders.versionJsonObject, minecraftVersion);

            if (Utils.isMcVersion("1.13", minecraftVersion)) {

                // install profile
                if (this._serverLauncherJsonObjects.modLoaders.isInstall) {

                    if (this._serverLauncherJsonObjects.modLoaders.installProfile === undefined) {
                        return reject("Undefined this._serverLauncherJsonObjects modLoaders installProfile.");
                    }
                    const installLibraries = this._serverLauncherJsonObjects.modLoaders.installProfile.libraries;
                    const librariesMerge = this._parsingModLoadersLibraries(installLibraries);
                    await this._validateDataDownload(librariesMerge, ProgressTypeEnum.validateDownloadInstallProfileModLoader);

                    await new ForgeInstaller(minecraftVersion, this._serverLauncherJsonObjects.modLoaders, this._progressManager).install();
                    fs.removeSync(path.join(GlobalPath.getCommonDirPath(), "temp", this._serverLauncherJsonObjects.id, "ForgeModLoader"));
                }
            }

            const libraries = this._parsingModLoadersLibraries(forgeVersionJsonParser.libraries);
            await this._validateDataDownload(libraries, ProgressTypeEnum.validateDownloadModLoader);

            return resolve();
        });
    }

    private _parsingModLoadersLibraries(libraries: Array<IForgeVersionLibraries>): Array<{ fileName: string, filePath: string, sha1: string, size: number, download: { url: string } }> {

        let librariesData = new Array<{ fileName: string, filePath: string, sha1: string, size: number, download: { url: string } }>();

        for (let lib of libraries) {
            if (lib.downloads.artifact.url.length !== 0) {
                librariesData.push({
                    fileName: Utils.urlLastName(lib.downloads.artifact.path) as string,
                    filePath: path.join(path.join(GlobalPath.getCommonDirPath(), "libraries"), lib.downloads.artifact.path),
                    sha1: lib.downloads.artifact.sha1,
                    size: lib.downloads.artifact.size,
                    download: {
                        url: lib.downloads.artifact.url
                    }
                });
            }
        }

        return librariesData;
    }

    private _installMinecraftLibraries(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {

            const libraries = this._mojangAssetsGameJsonObjects.libraries;
            await this._validateDataDownload(libraries, ProgressTypeEnum.validateDownloadLibraries);

            return resolve();
        });
    }

    private async _installMinecraftAssets(): Promise<void> {
        const objects = this._mojangAssetsGameJsonObjects.assetsObjects.objects;
        await this._validateDataDownload(objects, ProgressTypeEnum.validateDownloadMinecraftAssets);
    }

    private async _installModules(): Promise<void> {
        if (this._serverLauncherJsonObjects.modules === undefined) return;
        await this._validateDataDownload(this._parsingModules(this._serverLauncherJsonObjects.modules.modules), ProgressTypeEnum.validateDownloadModules);
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