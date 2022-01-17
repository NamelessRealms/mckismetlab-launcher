import * as fs from "fs-extra";
import * as path from "path";

import Java from "../java/Java";
import IMojangAssetsReturn from "../../interfaces/IMojangAssetsReturn";
import IServerLauncherReturn from "../../interfaces/IServerLauncherReturn";
import Configs from "../config/Configs";
import Downloader from "./Downloader";
import IModule from "../../interfaces/IModule";
import ForgeVersionJsonParser from "../parser/ForgeVersionJsonParser";
import Utils from "./Utils";
import IForgeVersionLibraries from "../../interfaces/IForgeVersionLibraries";
import GlobalPath from "../io/GlobalPath";
import ForgeInstaller from "../modLoaders/forge/ForgeInstaller";

export default class AssetsInstallerDownloader {

    private _limit: number;
    private _serverLauncherJsonObjects: IServerLauncherReturn;
    private _mojangAssetsGameJsonObjects: IMojangAssetsReturn;
    constructor(serverLauncherJsonObjects: IServerLauncherReturn, mojangAssetsGameJsonObjects: IMojangAssetsReturn) {
        this._limit = Configs.assetsDownloadLimit;
        this._serverLauncherJsonObjects = serverLauncherJsonObjects;
        this._mojangAssetsGameJsonObjects = mojangAssetsGameJsonObjects;
    }

    public async validateData(): Promise<void> {

        const javaData = {
            version: this._serverLauncherJsonObjects.java.version,
            fileName: this._serverLauncherJsonObjects.java.download.fileName,
            downloadUrl: this._serverLauncherJsonObjects.java.download.url
        }
        // validate install java
        await new Java().validateInstallJava(javaData);

        // validate install minecraft assets version jar
        await this._installMinecraftAssetsJar();

        // validate install modules
        await this._installModules();

        // validate install minecraft assets
        await this._installMinecraftAssets();

        // validate install minecraft libraries
        await this._installMinecraftLibraries();

        // validate install modLoaders
        await this._modLoadersInstall();

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
                    await this._validateDataDownload(librariesMerge);

                    await new ForgeInstaller(minecraftVersion, this._serverLauncherJsonObjects.modLoaders).install();
                    fs.removeSync(path.join(GlobalPath.getCommonDirPath(), "temp", this._serverLauncherJsonObjects.id, "ForgeModLoader"));
                }
            }

            const libraries = this._parsingModLoadersLibraries(forgeVersionJsonParser.libraries);
            await this._validateDataDownload(libraries);

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
            await this._validateDataDownload(libraries);

            return resolve();
        });
    }

    private _installMinecraftAssets(): Promise<void> {
        return new Promise<void>(async (resolve) => {

            const objects = this._mojangAssetsGameJsonObjects.assetsObjects.objects;
            await this._validateDataDownload(objects);

            return resolve();
        });
    }

    private _installModules(): Promise<void> {
        return new Promise<void>(async (resolve) => {

            if (this._serverLauncherJsonObjects.modules === undefined) {
                return resolve();
            }

            await this._validateDataDownload(this._parsingModules(this._serverLauncherJsonObjects.modules.modules));

            return resolve();
        });
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

    private _installMinecraftAssetsJar(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {

            const clientJar = this._mojangAssetsGameJsonObjects.client;
            const clientJarFilePath = this._mojangAssetsGameJsonObjects.client.filePath;

            if (!fs.existsSync(clientJarFilePath)) {
                await this._validateDataDownload([clientJar]);
            }

            return resolve();
        });
    }

    private _validateDataDownload(assets: Array<{ fileName: string, filePath: string, sha1: string, size: number, download: { url: string } }>): Promise<void> {
        return new Promise(async (resolve) => {

            let downloadQueue = new Array();

            for (let i = 0; i < assets.length; i++) {

                const asset = assets[i];
                const filePath = asset.filePath;
                const url = asset.download.url;

                const promiseDownload = (): Promise<void> => {
                    return new Promise(async (resolve) => {

                        // log.info(asset.fileName, fs.existsSync(filePath));

                        // this._progressBar.send(progressBarType, i, assets.length);

                        if (!fs.existsSync(filePath)) {
                            await Downloader.download(url, filePath);
                        }

                        return resolve();
                    });
                }

                downloadQueue.push(promiseDownload());

                if (downloadQueue.length >= this._limit || i + 1 >= assets.length) {
                    await Promise.all(downloadQueue);
                    downloadQueue = new Array();
                }
            }

            return resolve();
        });
    }
}