import * as path from "path";
import * as fs from "fs-extra";
import got from "got";

import GlobalPath from "../io/GlobalPath";
import MojangAssetsService from "../api/MojangAssetsService";
import MojangManifestParser from "../parser/MojangManifestParser";
import IAssetsObjectsReturn from "../../interfaces/IAssetsObjectsReturn";
import IMojangLib from "../../interfaces/IMojangLib";
import IGameLibraries from "../../interfaces/IGameLibraries";
import IMojangLibRules from "../../interfaces/IMojangLibRules";
import IMojangLibNatives from "../../interfaces/IMojangLibNatives";
import IMojangClientReturn from "../../interfaces/IMojangClientReturn";
import IMojangAssetsReturn from "../../interfaces/IMojangAssetsReturn";
import Utils from "../utils/Utils";

export default class MojangAssetsGameData {

    private _gameVersion: string;
    private _commandDirPath: string;

    constructor(gameVersion: string) {
        this._gameVersion = gameVersion;
        this._commandDirPath = GlobalPath.getCommonDirPath();
    }

    public mojangAssetsDataHandler(): Promise<IMojangAssetsReturn> {
        return new Promise(async (resolve, reject) => {
            try {

                const mojangManifest = await this._getMojangManifestJson(this._gameVersion);
                const mojangManifestParser = new MojangManifestParser(mojangManifest);

                // Mojang assets objects
                const mojangAssetsObjectHash = await this._getMojangAssetsObjectData(mojangManifestParser.assetsVersion, mojangManifestParser.assetIndexUrl);
                const mojangAssetsObjects = this._mojangAssetsObjectHashParser(mojangAssetsObjectHash, mojangManifestParser.assetsVersion);

                // Mojang libraries
                const mojangLibraries = this._getMojangLibrariesParser(mojangManifestParser.libraries);

                // Mojang client
                const mojangClient = this._getMojangClientData(mojangManifestParser.mojangClient);

                return resolve({
                    assetsObjects: mojangAssetsObjects,
                    libraries: mojangLibraries,
                    client: mojangClient,
                    mainClass: mojangManifestParser.mainClass,
                    arguments: mojangManifestParser.arguments,
                    versionType: mojangManifestParser.type
                });

            } catch (error: any) {
                return reject(error);
            }
        });
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

    private _getMojangAssetsObjectData(assetsVersion: string, assetIndexUrl: string): Promise<{ objects: { "": { hash: string, size: number } } }> {
        return new Promise(async (resolve, reject) => {

            const assetsObjectJsonPath = path.join(this._commandDirPath, "assets", "indexes", `${assetsVersion}.json`);

            if (fs.existsSync(assetsObjectJsonPath)) {
                return resolve(fs.readJsonSync(assetsObjectJsonPath));
            }

            const response = await got.get(assetIndexUrl);

            if (response.statusCode !== 200 || response.body === undefined) {
                return reject("Get asset index failure!");
            }

            // write assets indexes json file
            if(!fs.existsSync(assetsObjectJsonPath)) {
                fs.ensureDirSync(path.join(assetsObjectJsonPath, ".."));
                fs.writeFileSync(assetsObjectJsonPath, response.body, "utf8");
            }

            return resolve(JSON.parse(response.body));
        });
    }

    private _getMojangManifestJson(version: string): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {

            const gameVersionJsonPath = path.join(this._commandDirPath, "versions", this._gameVersion, `${this._gameVersion}.json`);

            if (fs.existsSync(gameVersionJsonPath)) {
                return resolve(fs.readJSONSync(gameVersionJsonPath));
            }

            const requestMojangVersionManifest = await MojangAssetsService.getVersionManifest();
            const findVersionManifest = requestMojangVersionManifest.versions.find(item => item.id === version);

            if (findVersionManifest === undefined) {
                return reject();
            }

            const response = await got.get(findVersionManifest.url);

            if (response.statusCode !== 200 || response.body === undefined) {
                return reject();
            }

            // write version json file
            if(!fs.existsSync(gameVersionJsonPath)) {
                fs.ensureDirSync(path.join(gameVersionJsonPath, ".."));
                fs.writeFileSync(gameVersionJsonPath, response.body, "utf8");
            }

            return resolve(JSON.parse(response.body));
        });
    }
}