import * as path from "path";
import * as fs from "fs-extra";
import got from "got";

import GlobalPath from "../io/GlobalPath";
import Utils from "../utils/Utils";
import Downloader from "../utils/Downloader";
import ModpackManifestParser from "../parser/ModpackManifestParser";
import CurseForgeModpackJsonObjParser from "../parser/CurseForgeModpackJsonObjParser";
import IModule from "../../interfaces/IModule";
import ModuleHandler from "./ModuleHandler";
import InstanceStore from "../io/InstanceStore";
import ProgressManager from "../utils/ProgressManager";
import { ProgressTypeEnum } from "../../enums/ProgressTypeEnum";
import { ProcessStop, Stop } from "../utils/ProcessStop";
import LoggerUtil from "../utils/LoggerUtil";

interface IFtbModpackAssetsResponse {
    "authors": Array<{
        "website": string,
        "id": number,
        "name": string,
        "type": string,
        "updated": number
    }>,
    "versions": Array<{
        "specs": {
            "id": number,
            "minimum": number,
            "recommended": number
        },
        "targets": Array<{
            "version": string,
            "id": number,
            "name": "forge" | "minecraft" | "fabric",
            "type": "modloader" | "game" | "java",
            "updated": number
        }>,
        "id": number,
        "name": string,
        "type": string,
        "updated": number
    }>
    "installs": number,
    "plays": number,
    "tags": Array<{
        "id": number,
        "name": string,
    }>;
    "featured": boolean,
    "refreshed": number,
    "notification": string,
    "id": number,
    "name": string,
    "type": string,
    "updated": number
}

interface IFtbModpackAssetsFile {
    "version": string,
    "path": string,
    "url": string,
    "mirrors": Array<any>,
    "sha1": string,
    "size": number,
    "tags": Array<any>,
    "clientonly": boolean,
    "serveronly": boolean,
    "optional": boolean,
    "id": number,
    "name": string,
    "type": string,
    "updated": number
}

interface IFtbModpackAssetsFileResponse {
    "files": Array<IFtbModpackAssetsFile>;
    "specs": {
        "id": number,
        "minimum": number,
        "recommended": number
    },
    "targets": Array<{
        "version": string,
        "id": number,
        "name": "forge" | "minecraft" | "fabric",
        "type": "modloader" | "game" | "java",
        "updated": number
    }>;
    "installs": number,
    "plays": number,
    "refreshed": number,
    "changelog": string,
    "parent": number,
    "notification": string,
    "id": number,
    "name": string,
    "type": string,
    "updated": number
}

export default class ModpackHandler {

    private _logger: LoggerUtil = new LoggerUtil("ModpackHandler");
    private _serverInstanceDir: string;
    private _serverId: string;
    private _modpackInstance: {
        type: "Revise" | "CurseForge" | "FTB";
        name: string;
        version: string;
        projectId: number;
        fileId: number;
        downloadUrl: string
    }
    private _instanceStore: InstanceStore;
    private _progressManager: ProgressManager;

    constructor(serverId: string, instanceIo: InstanceStore, modpackInstance: {
        type: "Revise" | "CurseForge" | "FTB";
        name: string;
        version: string;
        projectId: number;
        fileId: number;
        downloadUrl: string
    }, progressManager: ProgressManager) {
        this._serverId = serverId;
        this._serverInstanceDir = path.join(GlobalPath.getInstancesDirPath(), serverId);
        this._instanceStore = instanceIo;
        this._modpackInstance = modpackInstance;
        this._progressManager = progressManager;
    }

    public async getModpackAssetsHandler(): Promise<{
        isModpackReplace: boolean;
        modpackType: "Revise" | "CurseForge" | "FTB";
        modpack: {
            name: string;
            version: string;
            projectId: number;
            fileId: number;
        },
        modLoaderId: string;
        modules: Array<IModule>;
        files?: Array<{ fileName: string, filePath: string, sha1: string, size: number, download: { url: string } }>;
    }> {

        const tempModpackDirPath = path.join(GlobalPath.getInstancesDirPath(), this._serverId, ".TEMP", "modpack");
        const isModpackReplace = this._isModpackReplace(this._modpackInstance.type, this._modpackInstance.name, this._modpackInstance.version, this._modpackInstance.projectId);

        this._logger.info(`temp modpack dir path: ${tempModpackDirPath}`);
        this._logger.info(`判斷是否要更換模組包: ${isModpackReplace}`);
        this._logger.info(`模組包類型: ${this._modpackInstance.type}`);
        this._logger.info(`projectId: ${this._modpackInstance.projectId} fileId: ${this._modpackInstance.fileId}`);
        this._logger.info(`模組包版本: ${this._modpackInstance.version}`);

        // 檢查是否要更換模組包
        if (isModpackReplace) {

            const serverInstanceMinecraftDirPath = path.join(this._serverInstanceDir, ".minecraft");

            // FTB modpack 單獨抽出來處理
            if (this._modpackInstance.type === "FTB") {

                fs.emptyDirSync(serverInstanceMinecraftDirPath);

                const ftbModpackAssets = await this._getFtbModpackAssets(this._modpackInstance.projectId, this._modpackInstance.fileId);

                return {
                    isModpackReplace: isModpackReplace,
                    modpackType: this._modpackInstance.type,
                    modpack: {
                        name: ftbModpackAssets.name,
                        version: ftbModpackAssets.version,
                        projectId: ftbModpackAssets.projectId,
                        fileId: ftbModpackAssets.fileId
                    },
                    modLoaderId: ftbModpackAssets.modLoader.id,
                    modules: ftbModpackAssets.downloads.modules,
                    files: ftbModpackAssets.downloads.files
                };
            }

            let apiModpack = {
                fileName: "",
                downloadUrl: ""
            }

            // 檢查模組包的類型
            switch (this._modpackInstance.type) {
                case "CurseForge":
                    apiModpack = await this._modpackCurseForge(this._modpackInstance.projectId, this._modpackInstance.fileId, this._modpackInstance.name);
                    break;
                case "Revise":
                    apiModpack = await this._modpackRevise(this._modpackInstance.name, this._modpackInstance.downloadUrl);
                    break;
            }

            const tempModpackFilePath = path.join(tempModpackDirPath, apiModpack.fileName);
            const tempModpackOverridesDirPath = path.join(tempModpackDirPath, "overrides");
            const tempModpackManifestJsonPath = path.join(tempModpackDirPath, "manifest.json");

            // download modpack file
            await Downloader.download(apiModpack.downloadUrl, tempModpackFilePath, (percent) => this._progressManager.set(ProgressTypeEnum.downloadParseModpackData, percent));

            // unFile modpack file
            await Utils.unZipFile(tempModpackFilePath, path.join(tempModpackFilePath, ".."));

            // copy modpack overrides dir
            fs.emptyDirSync(serverInstanceMinecraftDirPath);
            this._logger.info(`Copy modpack overrides dir path: ${tempModpackOverridesDirPath} -> ${serverInstanceMinecraftDirPath}`);
            fs.copySync(tempModpackOverridesDirPath, serverInstanceMinecraftDirPath);
            this._logger.info(`Complete copy modpack overrides dir path: ${tempModpackOverridesDirPath} -> ${serverInstanceMinecraftDirPath}`);

            // stop
            ProcessStop.isThrowProcessStopped(this._serverId);

            const manifestJsonObject = fs.readJSONSync(tempModpackManifestJsonPath);
            const modpackManifestParser = new ModpackManifestParser(manifestJsonObject);
            this._logger.info(`handler modpack modules. length: ${modpackManifestParser.getModules().length}`);
            const modules = await new ModuleHandler(this._serverInstanceDir, this._serverId, this._progressManager).getModulesInfo(modpackManifestParser.getModules());

            this._logger.info(`Remove temp modpack dir path: ${tempModpackDirPath}`);
            fs.removeSync(tempModpackDirPath);
            this._logger.info(`Complete remove temp modpack dir path: ${tempModpackDirPath}`);

            return {
                isModpackReplace: isModpackReplace,
                modpackType: this._modpackInstance.type,
                modpack: {
                    name: modpackManifestParser.getName(),
                    version: this._modpackInstance.version,
                    projectId: this._modpackInstance.projectId,
                    fileId: this._modpackInstance.fileId
                },
                modLoaderId: modpackManifestParser.getModLoaderId(),
                modules: modules
            };

        } else {
            return {
                isModpackReplace: isModpackReplace,
                modpackType: this._modpackInstance.type,
                modpack: {
                    name: this._instanceStore.getModpackName(),
                    version: this._modpackInstance.version,
                    projectId: this._modpackInstance.projectId,
                    fileId: this._modpackInstance.fileId
                },
                modLoaderId: this._instanceStore.getModLoaderId(),
                modules: this._instanceStore.getModules(),
                files: this._instanceStore.getModpackFtbFiles()
            }
        }
    }

    private _modpackRevise(name: string, downloadUrl: string): Promise<{
        fileName: string;
        downloadUrl: string;
    }> {
        return new Promise((resolve) => {

            const modpackFileName = `${name}.zip`;

            return resolve({
                fileName: modpackFileName,
                downloadUrl: downloadUrl
            })
        });
    }

    private async _modpackCurseForge(projectId: number, fileId: number, name: string): Promise<{
        fileName: string;
        downloadUrl: string;
    }> {

        const modpackDownloadUrl = `https://addons-ecs.forgesvc.net/api/v2/addon/${projectId}/file/${fileId}`;

        this._logger.info(`請求 GET ${modpackDownloadUrl}`);

        const response = await got.get(modpackDownloadUrl);

        if (response.statusCode !== 200 || response.body === undefined) {
            this._logger.error(`請求失敗 GET ${modpackDownloadUrl}`);
            throw new Error("Get modpack failure.");
        }

        this._logger.info(`成功請求 GET ${modpackDownloadUrl}`);

        const curseForgeModpackJsonObjParser = new CurseForgeModpackJsonObjParser(JSON.parse(response.body));
        const modpackFileName = Utils.urlLastName(curseForgeModpackJsonObjParser.downloadUrl);

        if (modpackFileName === undefined) {
            throw new Error("modpackFileName not null.");
        }

        return {
            fileName: modpackFileName,
            downloadUrl: curseForgeModpackJsonObjParser.downloadUrl
        };
    }

    private async _getFtbModpackAssets(projectId: number, fileId: number) {

        const ftbModpackApiBaseUrl = "https://api.modpacks.ch";
        const ftbModpackAssetsObjsJsonUrl = `${ftbModpackApiBaseUrl}/public/modpack/${projectId}`;
        const ftbModpackAssetsFileObjsJsonUrl = `${ftbModpackApiBaseUrl}/public/modpack/${projectId}/${fileId}`;

        this._logger.info(`請求 GET ${ftbModpackAssetsObjsJsonUrl}`);
        this._logger.info(`請求 GET ${ftbModpackAssetsFileObjsJsonUrl}`);

        const ftbModpackAssetsResponse = await got.get<IFtbModpackAssetsResponse>(ftbModpackAssetsObjsJsonUrl, { responseType: "json" });
        const ftbModpackAssetsFileResponse = await got.get<IFtbModpackAssetsFileResponse>(ftbModpackAssetsFileObjsJsonUrl, { responseType: "json" });

        if(ftbModpackAssetsResponse.statusCode !== 200) {
            this._logger.error(`請求失敗 GET ${ftbModpackAssetsObjsJsonUrl}`);
            throw new Error("Get ftb modpack failure.");
        }

        if (ftbModpackAssetsFileResponse.statusCode !== 200) {
            this._logger.error(`請求失敗 GET ${ftbModpackAssetsFileObjsJsonUrl}`);
            throw new Error("Get ftb modpack failure.");
        }

        this._logger.info(`成功請求 GET ${ftbModpackAssetsObjsJsonUrl}`);
        this._logger.info(`成功請求 GET ${ftbModpackAssetsFileObjsJsonUrl}`);

        const parseFtbModpackAssetsFiles = this._parseFtbModpackAssetsFiles(ftbModpackAssetsFileResponse.body.files);

        this._logger.info(`Parse ftn modpack mods length: ${parseFtbModpackAssetsFiles.modules} files length: ${parseFtbModpackAssetsFiles.files}`);

        return {
            name: ftbModpackAssetsResponse.body.name,
            version: ftbModpackAssetsFileResponse.body.name,
            projectId: projectId,
            fileId: fileId,
            modLoader: {
                id: this._findFtbModpackModLoader(ftbModpackAssetsFileResponse.body.targets)
            },
            downloads: {
                files: parseFtbModpackAssetsFiles.files,
                modules: parseFtbModpackAssetsFiles.modules
            }
        }
    }

    private _parseFtbModpackAssetsFiles(modpackFiles: Array<IFtbModpackAssetsFile>): { files: Array<{ fileName: string, filePath: string, sha1: string, size: number, download: { url: string } }>, modules: Array<IModule> } {

        const files = new Array<{ fileName: string, filePath: string, sha1: string, size: number, download: { url: string } }>();
        const modules = new Array<IModule>();

        for (let file of modpackFiles) {
            if (file.type === "mod") {
                modules.push({
                    name: "",
                    type: "CurseForge",
                    action: "ADD",
                    fileName: file.name,
                    filePath: path.join(this._serverInstanceDir, ".minecraft", "mods", file.name),
                    projectId: 0,
                    fileId: 0,
                    sha1: file.sha1,
                    size: file.size,
                    version: file.version,
                    download: {
                        url: file.url
                    }
                });
            } else {
                files.push({
                    fileName: file.name,
                    filePath: path.join(this._serverInstanceDir, ".minecraft", file.path, file.name),
                    sha1: file.sha1,
                    size: file.size,
                    download: {
                        url: file.url
                    }
                });
            }
        }

        return {
            files: files,
            modules: modules
        }
    }

    // private _getFtbUrlProjectIdAndFileId(url: string): { projectId: number, fileId: number } {



    // }

    private _findFtbModpackModLoader(ftbTargets: Array<{ version: string, id: number, name: string, type: "modloader" | "game" | "java", updated: number }>): string {
        const modloader = ftbTargets.find((item) => item.type === "modloader");
        if (modloader === undefined) throw new Error("findFtbModpackModLoader 'modloader' not null.");
        return `${modloader.name}-${modloader.version}`;
    }

    private _isModpackReplace(modpackType: "Revise" | "CurseForge" | "FTB", modpackName: string, modpackVersion: string, modpackProjectId: number): boolean {
        switch (modpackType) {
            case "FTB":
            case "CurseForge": {

                const isProjectId = this._instanceStore.getModpackProjectId() === modpackProjectId ? false : true
                const isVersion = Utils.isVersion(this._instanceStore.getModpackVersion(), modpackVersion);

                this._logger.info(`if modpack replace InstanceStore projectId: ${this._instanceStore.getModpackProjectId()} - ${modpackProjectId} -> ${isProjectId}`);
                this._logger.info(`if modpack replace version: ${this._instanceStore.getModpackVersion()} - ${modpackVersion} -> ${isVersion}`);

                return isProjectId || isVersion;
            }
            case "Revise": {

                const isModpackName = this._instanceStore.getModpackName() !== modpackName;
                const isVersion = Utils.isVersion(this._instanceStore.getModpackVersion(), modpackVersion);

                this._logger.info(`if modpack replace name: ${this._instanceStore.getModpackName()} - ${modpackName} -> ${isModpackName}`);
                this._logger.info(`if modpack replace version: ${this._instanceStore.getModpackVersion()} - ${modpackVersion} -> ${isVersion}`);

                return isModpackName || isVersion;
            }
            default:
                return true;
        }
    }
}