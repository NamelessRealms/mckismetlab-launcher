import * as path from "path";
import * as fs from "fs-extra";
import got from "got";

import GlobalPath from "../io/GlobalPath";
import MojangAssetsService from "../../api/MojangAssetsService";
import MojangManifestParser from "../parser/MojangManifestParser";
import IAssetsObjectsReturn from "../../interfaces/IAssetsObjectsReturn";
import IMojangLib from "../../interfaces/IMojangLib";
import IGameLibraries from "../../interfaces/IGameLibraries";
import IMojangLibRules from "../../interfaces/IMojangLibRules";
import IMojangLibNatives from "../../interfaces/IMojangLibNatives";
import IMojangClientReturn from "../../interfaces/IMojangClientReturn";
import IMojangAssetsReturn from "../../interfaces/IMojangAssetsReturn";
import Utils from "../utils/Utils";
import ProgressManager from "../utils/ProgressManager";
import { ProgressTypeEnum } from "../../enums/ProgressTypeEnum";
import LoggerUtil from "../utils/LoggerUtil";

export default class MojangAssetsGameData {

    private _logger: LoggerUtil = new LoggerUtil("MojangAssetsGameData");
    private _gameVersion: string;
    private _commandDirPath: string;
    private _progressManager?: ProgressManager;

    constructor(gameVersion: string, progressManager?: ProgressManager) {
        this._gameVersion = gameVersion;
        this._commandDirPath = GlobalPath.getCommonDirPath();
        this._progressManager = progressManager;
    }

    public async mojangAssetsDataHandler(): Promise<IMojangAssetsReturn> {
        try {

            this._logger.info(`minecraft version ${this._gameVersion}`);

            const mojangManifest = await this._getMojangManifestJson(this._gameVersion);
            const mojangManifestParser = new MojangManifestParser(mojangManifest);

            // Mojang assets objects
            const mojangAssetsObjectHash = await this._getMojangAssetsObjectData(mojangManifestParser.assetsVersion, mojangManifestParser.assetIndexUrl);
            const mojangAssetsObjects = this._mojangAssetsObjectHashParser(mojangAssetsObjectHash, mojangManifestParser.assetsVersion);

            // Mojang libraries
            const mojangLibraries = this._getMojangLibrariesParser(mojangManifestParser.libraries);

            // Mojang client
            const mojangClient = this._getMojangClientData(mojangManifestParser.mojangClient);

            return {
                assetsObjects: mojangAssetsObjects,
                libraries: mojangLibraries,
                client: mojangClient,
                mainClass: mojangManifestParser.mainClass,
                arguments: mojangManifestParser.arguments,
                versionType: mojangManifestParser.type,
                assetsVersion: mojangManifestParser.assetsVersion
            };

        } catch (error: any) {
            throw new Error(error);
        }
    }

    public async removeMojangLibrariesHandler(): Promise<void> {
        try {

            const mojangManifest = await this._getMojangManifestJson(this._gameVersion);
            const mojangManifestParser = new MojangManifestParser(mojangManifest);

            // Mojang libraries
            const mojangLibraries = this._getMojangLibrariesParser(mojangManifestParser.libraries);

            this._removeMojangLibrariesFile(mojangLibraries);

        } catch (error: any) {
            throw new Error(error);
        }
    }

    private _removeMojangLibrariesFile(libraries: Array<IMojangClientReturn>): void {
        for (let lib of libraries) {
            if (fs.existsSync(lib.filePath)) fs.removeSync(lib.filePath);
        }
    }

    public async removeMojangAssetsDataHandler(): Promise<void> {
        try {

            const mojangManifest = await this._getMojangManifestJson(this._gameVersion);
            const mojangManifestParser = new MojangManifestParser(mojangManifest);

            // Mojang assets objects
            const mojangAssetsObjectHash = await this._getMojangAssetsObjectData(mojangManifestParser.assetsVersion, mojangManifestParser.assetIndexUrl);

            this._removeMojangAssetsFile(mojangAssetsObjectHash);

        } catch (error: any) {
            throw new Error(error);
        }
    }

    private _removeMojangAssetsFile(objectsJson: { objects: { "": { hash: string, size: number } } }): void {

        const objects = Object.values(objectsJson.objects);

        for (let obj of objects) {
            const dirName = this._getObjectsDirName(obj.hash);
            const objFilePath = path.join(this._commandDirPath, "assets", "objects", dirName, obj.hash);
            if (fs.existsSync(objFilePath)) fs.removeSync(objFilePath);
        }
    }

    private _getMojangClientData(mojangClient: { sha1: string, size: number, url: string }): IMojangClientReturn {
        return {
            fileName: `${this._gameVersion}.jar`,
            filePath: path.join(this._commandDirPath, "versions", this._gameVersion, `${this._gameVersion}.jar`),
            sha1: mojangClient.sha1,
            size: mojangClient.size,
            download: {
                url: mojangClient.url
            }
        }
    }

    private _getMojangLibrariesParser(libraries: Array<IMojangLib>): Array<IGameLibraries> {

        const gameLibrariesDirPath = path.join(this._commandDirPath, "libraries");
        const libs = new Array<IGameLibraries>();

        for (let lib of libraries) {

            if (this._isValidateLibRules(lib.rules, lib.natives)) {

                if (lib.natives === undefined) {

                    const artifact = lib.downloads.artifact;

                    libs.push({
                        libType: "artifact",
                        fileName: this._getLastPathName(artifact.path),
                        filePath: path.join(gameLibrariesDirPath, artifact.path),
                        sha1: artifact.sha1,
                        size: artifact.size,
                        download: {
                            url: artifact.url
                        }
                    });

                } else {

                    const classifiers = lib.downloads.classifiers[lib.natives[Utils.getOSType()]];

                    libs.push({
                        libType: "natives",
                        fileName: this._getLastPathName(classifiers.path),
                        filePath: path.join(gameLibrariesDirPath, classifiers.path),
                        sha1: classifiers.sha1,
                        size: classifiers.size,
                        download: {
                            url: classifiers.url
                        }
                    });

                }

            }

        }

        return libs;
    }

    private _getLastPathName(filePath: string) {
        return filePath.split("/").pop() || "";
    }

    private _isValidateLibRules(rules: Array<IMojangLibRules>, natives: IMojangLibNatives): boolean {

        if (rules === undefined) {
            if (natives === undefined) {
                return true;
            } else {
                return natives[Utils.getOSType()] !== undefined;
            }
        }

        for (let rule of rules) {
            const action = rule.action;
            const osProp = rule.os;

            if (action !== undefined && osProp !== undefined) {

                const osName = osProp.name;
                const osMojang = Utils.getOSType();

                if (action === "allow") {
                    return osName === osMojang;
                } else if (action === "disallow") {
                    return osName !== osMojang;
                }
            }
        }

        return true;
    }

    private _mojangAssetsObjectHashParser(objectsJson: { objects: { "": { hash: string, size: number } } }, assetsVersion: string): IAssetsObjectsReturn {

        const assetsObjects = new Array<{
            fileName: string,
            filePath: string,
            sha1: string,
            size: number,
            download: {
                url: string,
            }
        }>();

        const objects = Object.values(objectsJson.objects);

        for (let obj of objects) {
            const dirName = this._getObjectsDirName(obj.hash);
            assetsObjects.push({
                fileName: obj.hash,
                filePath: path.join(this._commandDirPath, "assets", "objects", dirName, obj.hash),
                sha1: obj.hash,
                size: obj.size,
                download: {
                    url: `http://resources.download.minecraft.net/${dirName}/${obj.hash}`,
                }
            });
        }

        return {
            objects: assetsObjects,
            jsonObjects: {
                data: objectsJson,
                filePath: path.join(this._commandDirPath, "assets", "indexes", `${assetsVersion}.json`)
            }
        }
    }

    private _getObjectsDirName(fileName: string): string {
        return fileName.substring(0, 2);
    }

    private async _getMojangAssetsObjectData(assetsVersion: string, assetIndexUrl: string): Promise<{ objects: { "": { hash: string, size: number } } }> {

        if (this._progressManager !== undefined) this._progressManager.set(ProgressTypeEnum.getMojangAssetsObjectData, 1, 2);
        const assetsObjectJsonPath = path.join(this._commandDirPath, "assets", "indexes", `${assetsVersion}.json`);

        if (fs.existsSync(assetsObjectJsonPath)) {
            if (this._progressManager !== undefined) this._progressManager.set(ProgressTypeEnum.getMojangAssetsObjectData, 2, 2);
            this._logger.info(`讀取檔案 Path: ${assetsObjectJsonPath}`);
            const mojangAssetsObjectHashData = fs.readJsonSync(assetsObjectJsonPath);
            this._logger.info(`成功讀取檔案 Path: ${assetsObjectJsonPath}`);
            return mojangAssetsObjectHashData;
        }

        this._logger.info(`請求 GET ${assetIndexUrl}`);
        const response = await got.get<{ objects: { "": { hash: string, size: number } } }>(assetIndexUrl, { responseType: "json"});

        if (response.statusCode !== 200 || response.body === undefined) {
            this._logger.error(`請求失敗 GET ${assetIndexUrl}`);
            throw new Error("Get asset index failure.")
        }
        this._logger.info(`成功請求 GET ${assetIndexUrl}`);

        // write assets indexes json file
        if (!fs.existsSync(assetsObjectJsonPath)) {
            this._logger.info(`寫入檔案 Temp path: ${assetsObjectJsonPath}`);
            fs.ensureDirSync(path.join(assetsObjectJsonPath, ".."));
            fs.writeFileSync(assetsObjectJsonPath, JSON.stringify(response.body), "utf8");
            this._logger.info(`成功寫入檔案 Temp path: ${assetsObjectJsonPath}`);
        }

        if (this._progressManager !== undefined) this._progressManager.set(ProgressTypeEnum.getMojangAssetsObjectData, 2, 2);
        return response.body;
    }

    private async _getMojangManifestJson(version: string): Promise<any> {

        if (this._progressManager !== undefined) this._progressManager.set(ProgressTypeEnum.getMojangManifestData, 1, 2);
        const gameVersionJsonPath = path.join(this._commandDirPath, "versions", this._gameVersion, `${this._gameVersion}.json`);

        if (fs.existsSync(gameVersionJsonPath)) {
            if (this._progressManager !== undefined) this._progressManager.set(ProgressTypeEnum.getMojangManifestData, 2, 2);
            this._logger.info(`讀取檔案 Path: ${gameVersionJsonPath}`);
            const mojangManifestData = fs.readJSONSync(gameVersionJsonPath);
            this._logger.info(`成功讀取檔案 Path: ${gameVersionJsonPath}`);
            return mojangManifestData;
        }

        const requestMojangVersionManifest = await MojangAssetsService.getVersionManifest();
        const findVersionManifest = requestMojangVersionManifest.versions.find(item => item.id === version);

        if (findVersionManifest === undefined) {
            throw new Error("findVersionManifest not null.");
        }

        this._logger.info(`請求 GET ${findVersionManifest.url}`);
        const response = await got.get(findVersionManifest.url, { responseType: "json" });

        if (response.statusCode !== 200 || response.body === undefined) {
            this._logger.error(`請求失敗 GET ${findVersionManifest.url}`);
            throw new Error("GET version manifest failure.");
        }
        this._logger.info(`成功請求 GET ${findVersionManifest.url}`);

        // write version json file
        if (!fs.existsSync(gameVersionJsonPath)) {
            this._logger.info(`寫入檔案 Temp path: ${gameVersionJsonPath}`);
            fs.ensureDirSync(path.join(gameVersionJsonPath, ".."));
            fs.writeFileSync(gameVersionJsonPath, JSON.stringify(response.body), "utf8");
            this._logger.info(`成功寫入檔案 Temp path: ${gameVersionJsonPath}`);
        }

        if (this._progressManager !== undefined) this._progressManager.set(ProgressTypeEnum.getMojangManifestData, 2, 2);
        return response.body;
    }
}