"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = require("path");
const fs = require("fs-extra");
const got_1 = require("got");
const GlobalPath_1 = require("../io/GlobalPath");
const Utils_1 = require("../utils/Utils");
const Downloader_1 = require("../utils/Downloader");
const ModpackManifestParser_1 = require("../parser/ModpackManifestParser");
const CurseForgeModpackJsonObjParser_1 = require("../parser/CurseForgeModpackJsonObjParser");
const ModuleHandler_1 = require("./ModuleHandler");
const ProgressTypeEnum_1 = require("../../enums/ProgressTypeEnum");
const ProcessStop_1 = require("../utils/ProcessStop");
const LoggerUtil_1 = require("../utils/LoggerUtil");
const Configs_1 = require("../../config/Configs");
class ModpackHandler {
    constructor(serverId, instanceIo, modpackInstance, progressManager) {
        this._logger = new LoggerUtil_1.default("ModpackHandler");
        this._serverId = serverId;
        this._serverInstanceDir = path.join(GlobalPath_1.default.getInstancesDirPath(), serverId);
        this._instanceStore = instanceIo;
        this._modpackInstance = modpackInstance;
        this._progressManager = progressManager;
    }
    getModpackAssetsHandler() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const tempModpackDirPath = path.join(GlobalPath_1.default.getInstancesDirPath(), this._serverId, ".TEMP", "modpack");
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
                    const ftbModpackAssets = yield this._getFtbModpackAssets(this._modpackInstance.projectId, this._modpackInstance.fileId);
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
                };
                // 檢查模組包的類型
                switch (this._modpackInstance.type) {
                    case "CurseForge":
                        apiModpack = yield this._modpackCurseForge(this._modpackInstance.projectId, this._modpackInstance.fileId, this._modpackInstance.name);
                        break;
                    case "Revise":
                        apiModpack = yield this._modpackRevise(this._modpackInstance.name, this._modpackInstance.downloadUrl);
                        break;
                }
                const tempModpackFilePath = path.join(tempModpackDirPath, apiModpack.fileName);
                const tempModpackOverridesDirPath = path.join(tempModpackDirPath, "overrides");
                const tempModpackManifestJsonPath = path.join(tempModpackDirPath, "manifest.json");
                // download modpack file
                yield Downloader_1.default.download(apiModpack.downloadUrl, tempModpackFilePath, (percent) => this._progressManager.set(ProgressTypeEnum_1.ProgressTypeEnum.downloadParseModpackData, percent));
                // unFile modpack file
                yield Utils_1.default.unZipFile(tempModpackFilePath, path.join(tempModpackFilePath, ".."));
                // copy modpack overrides dir
                fs.emptyDirSync(serverInstanceMinecraftDirPath);
                this._logger.info(`Copy modpack overrides dir path: ${tempModpackOverridesDirPath} -> ${serverInstanceMinecraftDirPath}`);
                fs.copySync(tempModpackOverridesDirPath, serverInstanceMinecraftDirPath);
                this._logger.info(`Complete copy modpack overrides dir path: ${tempModpackOverridesDirPath} -> ${serverInstanceMinecraftDirPath}`);
                // stop
                ProcessStop_1.ProcessStop.isThrowProcessStopped(this._serverId);
                const manifestJsonObject = fs.readJSONSync(tempModpackManifestJsonPath);
                const modpackManifestParser = new ModpackManifestParser_1.default(manifestJsonObject);
                this._logger.info(`handler modpack modules. length: ${modpackManifestParser.getModules().length}`);
                const modules = yield new ModuleHandler_1.default(this._serverInstanceDir, this._serverId, this._progressManager).getModulesInfo(modpackManifestParser.getModules());
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
            }
            else {
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
                };
            }
        });
    }
    _modpackRevise(name, downloadUrl) {
        return new Promise((resolve) => {
            const modpackFileName = `${name}.zip`;
            return resolve({
                fileName: modpackFileName,
                downloadUrl: downloadUrl
            });
        });
    }
    _modpackCurseForge(projectId, fileId, name) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // const modpackDownloadUrl = `https://addons-ecs.forgesvc.net/api/v2/addon/${projectId}/file/${fileId}`;
            const modpackDownloadUrl = `${Configs_1.default.apiUrl}/modpacks/${projectId}/file/${fileId}`;
            this._logger.info(`請求 GET ${modpackDownloadUrl}`);
            const response = yield got_1.default.get(modpackDownloadUrl, { responseType: "json" });
            if (response.statusCode !== 200 || response.body === undefined) {
                this._logger.error(`請求失敗 GET ${modpackDownloadUrl}`);
                throw new Error("Get modpack failure.");
            }
            this._logger.info(`成功請求 GET ${modpackDownloadUrl}`);
            const curseForgeModpackJsonObjParser = new CurseForgeModpackJsonObjParser_1.default(response.body.data);
            // ! Flx curseforge api downloadUrl null issues
            let downloadUrl;
            if (curseForgeModpackJsonObjParser.downloadUrl !== null) {
                downloadUrl = curseForgeModpackJsonObjParser.downloadUrl;
            }
            else {
                downloadUrl = Utils_1.default.flxCurseforgeDownloadUrlNullIssues(curseForgeModpackJsonObjParser.id, curseForgeModpackJsonObjParser.fileName);
            }
            // ! ---------------------------------------------------------------- //
            const modpackFileName = Utils_1.default.urlLastName(modpackDownloadUrl);
            if (modpackFileName === undefined) {
                throw new Error("modpackFileName not null.");
            }
            return {
                fileName: modpackFileName,
                downloadUrl: downloadUrl
            };
        });
    }
    _getFtbModpackAssets(projectId, fileId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const ftbModpackApiBaseUrl = "https://api.modpacks.ch";
            const ftbModpackAssetsObjsJsonUrl = `${ftbModpackApiBaseUrl}/public/modpack/${projectId}`;
            const ftbModpackAssetsFileObjsJsonUrl = `${ftbModpackApiBaseUrl}/public/modpack/${projectId}/${fileId}`;
            this._logger.info(`請求 GET ${ftbModpackAssetsObjsJsonUrl}`);
            this._logger.info(`請求 GET ${ftbModpackAssetsFileObjsJsonUrl}`);
            const ftbModpackAssetsResponse = yield got_1.default.get(ftbModpackAssetsObjsJsonUrl, { responseType: "json" });
            const ftbModpackAssetsFileResponse = yield got_1.default.get(ftbModpackAssetsFileObjsJsonUrl, { responseType: "json" });
            if (ftbModpackAssetsResponse.statusCode !== 200) {
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
            };
        });
    }
    _parseFtbModpackAssetsFiles(modpackFiles) {
        const files = new Array();
        const modules = new Array();
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
                    },
                    userRevert: false
                });
            }
            else {
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
        };
    }
    // private _getFtbUrlProjectIdAndFileId(url: string): { projectId: number, fileId: number } {
    // }
    _findFtbModpackModLoader(ftbTargets) {
        const modloader = ftbTargets.find((item) => item.type === "modloader");
        if (modloader === undefined)
            throw new Error("findFtbModpackModLoader 'modloader' not null.");
        return `${modloader.name}-${modloader.version}`;
    }
    _isModpackReplace(modpackType, modpackName, modpackVersion, modpackProjectId) {
        switch (modpackType) {
            case "FTB":
            case "CurseForge": {
                const isProjectId = this._instanceStore.getModpackProjectId() === modpackProjectId ? false : true;
                const isVersion = Utils_1.default.isVersion(this._instanceStore.getModpackVersion(), modpackVersion);
                this._logger.info(`if modpack replace InstanceStore projectId: ${this._instanceStore.getModpackProjectId()} - ${modpackProjectId} -> ${isProjectId}`);
                this._logger.info(`if modpack replace version: ${this._instanceStore.getModpackVersion()} - ${modpackVersion} -> ${isVersion}`);
                return isProjectId || isVersion;
            }
            case "Revise": {
                const isModpackName = this._instanceStore.getModpackName() !== modpackName;
                const isVersion = Utils_1.default.isVersion(this._instanceStore.getModpackVersion(), modpackVersion);
                this._logger.info(`if modpack replace name: ${this._instanceStore.getModpackName()} - ${modpackName} -> ${isModpackName}`);
                this._logger.info(`if modpack replace version: ${this._instanceStore.getModpackVersion()} - ${modpackVersion} -> ${isVersion}`);
                return isModpackName || isVersion;
            }
            default:
                return true;
        }
    }
}
exports.default = ModpackHandler;
//# sourceMappingURL=ModpackHandler.js.map