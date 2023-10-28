"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = require("path");
const fs = require("fs-extra");
const got_1 = require("got");
const GlobalPath_1 = require("../io/GlobalPath");
const MojangAssetsService_1 = require("../../api/MojangAssetsService");
const MojangManifestParser_1 = require("../parser/MojangManifestParser");
const Utils_1 = require("../utils/Utils");
const ProgressTypeEnum_1 = require("../../enums/ProgressTypeEnum");
const LoggerUtil_1 = require("../utils/LoggerUtil");
class MojangAssetsGameData {
    constructor(gameVersion, progressManager) {
        this._logger = new LoggerUtil_1.default("MojangAssetsGameData");
        this._gameVersion = gameVersion;
        this._commandDirPath = GlobalPath_1.default.getCommonDirPath();
        this._progressManager = progressManager;
    }
    mojangAssetsDataHandler() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                this._logger.info(`minecraft version ${this._gameVersion}`);
                const mojangManifest = yield this._getMojangManifestJson(this._gameVersion);
                const mojangManifestParser = new MojangManifestParser_1.default(mojangManifest);
                // Mojang assets objects
                const mojangAssetsObjectHash = yield this._getMojangAssetsObjectData(mojangManifestParser.assetsVersion, mojangManifestParser.assetIndexUrl);
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
            }
            catch (error) {
                throw new Error(error);
            }
        });
    }
    removeMojangLibrariesHandler() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const mojangManifest = yield this._getMojangManifestJson(this._gameVersion);
                const mojangManifestParser = new MojangManifestParser_1.default(mojangManifest);
                // Mojang libraries
                const mojangLibraries = this._getMojangLibrariesParser(mojangManifestParser.libraries);
                this._removeMojangLibrariesFile(mojangLibraries);
            }
            catch (error) {
                throw new Error(error);
            }
        });
    }
    _removeMojangLibrariesFile(libraries) {
        for (let lib of libraries) {
            if (fs.existsSync(lib.filePath))
                fs.removeSync(lib.filePath);
        }
    }
    removeMojangAssetsDataHandler() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const mojangManifest = yield this._getMojangManifestJson(this._gameVersion);
                const mojangManifestParser = new MojangManifestParser_1.default(mojangManifest);
                // Mojang assets objects
                const mojangAssetsObjectHash = yield this._getMojangAssetsObjectData(mojangManifestParser.assetsVersion, mojangManifestParser.assetIndexUrl);
                this._removeMojangAssetsFile(mojangAssetsObjectHash);
            }
            catch (error) {
                throw new Error(error);
            }
        });
    }
    _removeMojangAssetsFile(objectsJson) {
        const objects = Object.values(objectsJson.objects);
        for (let obj of objects) {
            const dirName = this._getObjectsDirName(obj.hash);
            const objFilePath = path.join(this._commandDirPath, "assets", "objects", dirName, obj.hash);
            if (fs.existsSync(objFilePath))
                fs.removeSync(objFilePath);
        }
    }
    _getMojangClientData(mojangClient) {
        return {
            fileName: `${this._gameVersion}.jar`,
            filePath: path.join(this._commandDirPath, "versions", this._gameVersion, `${this._gameVersion}.jar`),
            sha1: mojangClient.sha1,
            size: mojangClient.size,
            download: {
                url: mojangClient.url
            }
        };
    }
    _getMojangLibrariesParser(libraries) {
        const gameLibrariesDirPath = path.join(this._commandDirPath, "libraries");
        const libs = new Array();
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
                }
                else {
                    const classifiers = lib.downloads.classifiers[lib.natives[Utils_1.default.getOSType()]];
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
    _getLastPathName(filePath) {
        return filePath.split("/").pop() || "";
    }
    _isValidateLibRules(rules, natives) {
        if (rules === undefined) {
            if (natives === undefined) {
                return true;
            }
            else {
                return natives[Utils_1.default.getOSType()] !== undefined;
            }
        }
        for (let rule of rules) {
            const action = rule.action;
            const osProp = rule.os;
            if (action !== undefined && osProp !== undefined) {
                const osName = osProp.name;
                const osMojang = Utils_1.default.getOSType();
                if (action === "allow") {
                    return osName === osMojang;
                }
                else if (action === "disallow") {
                    return osName !== osMojang;
                }
            }
        }
        return true;
    }
    _mojangAssetsObjectHashParser(objectsJson, assetsVersion) {
        const assetsObjects = new Array();
        const objects = Object.values(objectsJson.objects);
        for (let obj of objects) {
            const dirName = this._getObjectsDirName(obj.hash);
            assetsObjects.push({
                fileName: obj.hash,
                filePath: path.join(this._commandDirPath, "assets", "objects", dirName, obj.hash),
                sha1: obj.hash,
                size: obj.size,
                download: {
                    url: `https://resources.download.minecraft.net/${dirName}/${obj.hash}`,
                }
            });
        }
        return {
            objects: assetsObjects,
            jsonObjects: {
                data: objectsJson,
                filePath: path.join(this._commandDirPath, "assets", "indexes", `${assetsVersion}.json`)
            }
        };
    }
    _getObjectsDirName(fileName) {
        return fileName.substring(0, 2);
    }
    _getMojangAssetsObjectData(assetsVersion, assetIndexUrl) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this._progressManager !== undefined)
                this._progressManager.set(ProgressTypeEnum_1.ProgressTypeEnum.getMojangAssetsObjectData, 1, 2);
            const assetsObjectJsonPath = path.join(this._commandDirPath, "assets", "indexes", `${assetsVersion}.json`);
            if (fs.existsSync(assetsObjectJsonPath)) {
                if (this._progressManager !== undefined)
                    this._progressManager.set(ProgressTypeEnum_1.ProgressTypeEnum.getMojangAssetsObjectData, 2, 2);
                this._logger.info(`讀取檔案 Path: ${assetsObjectJsonPath}`);
                const mojangAssetsObjectHashData = fs.readJsonSync(assetsObjectJsonPath);
                this._logger.info(`成功讀取檔案 Path: ${assetsObjectJsonPath}`);
                return mojangAssetsObjectHashData;
            }
            this._logger.info(`請求 GET ${assetIndexUrl}`);
            const response = yield got_1.default.get(assetIndexUrl, { responseType: "json" });
            if (response.statusCode !== 200 || response.body === undefined) {
                this._logger.error(`請求失敗 GET ${assetIndexUrl}`);
                throw new Error("Get asset index failure.");
            }
            this._logger.info(`成功請求 GET ${assetIndexUrl}`);
            // write assets indexes json file
            if (!fs.existsSync(assetsObjectJsonPath)) {
                this._logger.info(`寫入檔案 Temp path: ${assetsObjectJsonPath}`);
                fs.ensureDirSync(path.join(assetsObjectJsonPath, ".."));
                fs.writeFileSync(assetsObjectJsonPath, JSON.stringify(response.body), "utf8");
                this._logger.info(`成功寫入檔案 Temp path: ${assetsObjectJsonPath}`);
            }
            if (this._progressManager !== undefined)
                this._progressManager.set(ProgressTypeEnum_1.ProgressTypeEnum.getMojangAssetsObjectData, 2, 2);
            return response.body;
        });
    }
    _getMojangManifestJson(version) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this._progressManager !== undefined)
                this._progressManager.set(ProgressTypeEnum_1.ProgressTypeEnum.getMojangManifestData, 1, 2);
            const gameVersionJsonPath = path.join(this._commandDirPath, "versions", this._gameVersion, `${this._gameVersion}.json`);
            if (fs.existsSync(gameVersionJsonPath)) {
                if (this._progressManager !== undefined)
                    this._progressManager.set(ProgressTypeEnum_1.ProgressTypeEnum.getMojangManifestData, 2, 2);
                this._logger.info(`讀取檔案 Path: ${gameVersionJsonPath}`);
                const mojangManifestData = fs.readJSONSync(gameVersionJsonPath);
                this._logger.info(`成功讀取檔案 Path: ${gameVersionJsonPath}`);
                return mojangManifestData;
            }
            const requestMojangVersionManifest = yield MojangAssetsService_1.default.getVersionManifest();
            const findVersionManifest = requestMojangVersionManifest.versions.find(item => item.id === version);
            if (findVersionManifest === undefined) {
                throw new Error("findVersionManifest not null.");
            }
            this._logger.info(`請求 GET ${findVersionManifest.url}`);
            const response = yield got_1.default.get(findVersionManifest.url, { responseType: "json" });
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
            if (this._progressManager !== undefined)
                this._progressManager.set(ProgressTypeEnum_1.ProgressTypeEnum.getMojangManifestData, 2, 2);
            return response.body;
        });
    }
}
exports.default = MojangAssetsGameData;
//# sourceMappingURL=MojangAssetsGameData.js.map