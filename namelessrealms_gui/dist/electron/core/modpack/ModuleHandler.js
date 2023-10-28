"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const got_1 = require("got");
const path = require("path");
const ProgressTypeEnum_1 = require("../../enums/ProgressTypeEnum");
const ProcessStop_1 = require("../utils/ProcessStop");
const LoggerUtil_1 = require("../utils/LoggerUtil");
const Configs_1 = require("../../config/Configs");
const Utils_1 = require("../../core/utils/Utils");
class ModuleHandler {
    constructor(serverInstanceDir, serverId, ProgressManager) {
        this._logger = new LoggerUtil_1.default("ModuleHandler");
        this._serverInstanceDir = serverInstanceDir;
        this._serverId = serverId;
        this._progressManager = ProgressManager;
    }
    getModuleAssetHandler(launcherAssetsModules, modpackModuleData, localModules) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let modpackModules = modpackModuleData.modules;
            let moduleData = {
                ADD: new Array(),
                REMOVE: new Array(),
                modules: new Array(),
                size: 0
            };
            this._logger.info(`launcher assets modules length: ${launcherAssetsModules.length}`);
            for (let i = 0; i < launcherAssetsModules.length; i++) {
                const launcherAssetsModule = launcherAssetsModules[i];
                this._progressManager.set(ProgressTypeEnum_1.ProgressTypeEnum.processModulesData, i, launcherAssetsModules.length - 1);
                // stop
                ProcessStop_1.ProcessStop.isThrowProcessStopped(this._serverId);
                // this._logger.info(`launcher module name: ${launcherAssetsModule.name} projectId: ${launcherAssetsModule.projectId} fileId: ${launcherAssetsModule.fileId}`);
                const isLocalModule = localModules.find(item => item.projectId === launcherAssetsModule.projectId && item.fileId === launcherAssetsModule.fileId);
                // this._logger.info(`launcher assets 檢查模組是否安裝到本地 -> ${isLocalModule === undefined ? false : true}`);
                if (isLocalModule === undefined) {
                    let module = yield this._moduleInfo(launcherAssetsModule);
                    this._logger.info(`Action: ${launcherAssetsModule.action}`);
                    switch (launcherAssetsModule.action) {
                        case "ADD":
                            moduleData.ADD.push(module);
                            localModules.push(module);
                            break;
                        case "REMOVE":
                            if (modpackModuleData.type === "FTB") {
                                modpackModules = modpackModules.filter(item => item.fileName !== module.fileName);
                            }
                            else {
                                modpackModules = modpackModules.filter(item => item.projectId !== module.projectId);
                            }
                            moduleData.REMOVE.push(module);
                            break;
                    }
                }
            }
            for (let modpackModule of modpackModules) {
                // this._logger.info(`modpack module name: ${modpackModule.name} projectId: ${modpackModule.projectId} fileId: ${modpackModule.fileId}`);
                const isLocalModule = this._isLocalModule(modpackModuleData.type, localModules, modpackModule);
                // this._logger.info(`modpack assets 檢查模組是否安裝到本地 -> ${isLocalModule ? false : true}`);
                if (isLocalModule) {
                    localModules.push(modpackModule);
                    moduleData.ADD.push(modpackModule);
                }
            }
            moduleData.modules = localModules;
            moduleData.size = localModules.length;
            this._logger.info(`總共模組length: ${moduleData.size}`);
            return moduleData;
        });
    }
    _isLocalModule(modpackType, localModules, modpackModule) {
        if (localModules.length <= 0)
            return true;
        if (modpackType === "FTB") {
            for (let localModule of localModules) {
                if (localModule.fileName === modpackModule.fileName)
                    return false;
            }
            return true;
        }
        for (let localModule of localModules) {
            if (localModule.projectId === modpackModule.projectId && localModule.fileId === modpackModule.fileId)
                return false;
        }
        return true;
    }
    getModulesInfo(modules) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const moduleUrl = `${Configs_1.default.apiUrl}/mods/files`;
            const modulesData = new Array();
            const filesIds = new Array();
            for (let module of modules) {
                filesIds.push(module.fileID);
            }
            this._logger.info(`請求 GET ${moduleUrl}`);
            const moduleResponse = yield got_1.default.post(moduleUrl, {
                responseType: "json",
                json: {
                    fileIds: filesIds
                }
            });
            if (moduleResponse.statusCode !== 200 || moduleResponse.body === undefined) {
                this._logger.error(`請求失敗 GET ${moduleUrl}`);
                throw new Error("Get modules failure.");
            }
            ;
            this._logger.info(`成功請求 GET ${moduleUrl}`);
            // stop
            ProcessStop_1.ProcessStop.isThrowProcessStopped(this._serverId);
            for (let module of moduleResponse.body.data) {
                // Flx curseforge api downloadUrl null issues
                if (module.downloadUrl === null) {
                    this._logger.warn(module.displayName);
                    module.downloadUrl = Utils_1.default.flxCurseforgeDownloadUrlNullIssues(module.id, module.fileName);
                }
                modulesData.push({
                    name: module.displayName,
                    type: "CurseForge",
                    action: "ADD",
                    projectId: module.modId,
                    fileId: module.id,
                    fileName: module.fileName,
                    filePath: path.join(this._serverInstanceDir, ".minecraft", "mods", module.fileName),
                    sha1: "",
                    size: 0,
                    version: "",
                    download: {
                        url: module.downloadUrl
                    },
                    userRevert: false
                });
            }
            // for (let i = 0; i < modules.length; i++) {
            //     const module = modules[i];
            //     let moduleInfo = await this._moduleInfo({
            //         name: "",
            //         type: "CurseForge",
            //         action: "ADD",
            //         projectId: module.projectID,
            //         fileId: module.fileID
            //     });
            //     modulesData.push(moduleInfo);
            //     this._progressManager.set(ProgressTypeEnum.getModpackModulesInfo, i, modules.length - 1);
            //     // stop
            //     ProcessStop.isThrowProcessStopped(this._serverId);
            // }
            return modulesData;
        });
    }
    _moduleInfo(module) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const projectId = module.projectId;
            const fileId = module.fileId;
            // const moduleUrl = `https://addons-ecs.forgesvc.net/api/v2/addon/${projectId}/file/${fileId}`;
            const moduleUrl = `${Configs_1.default.apiUrl}/mods/${projectId}/file/${fileId}`;
            this._logger.info(`module projectId: ${projectId} fileId: ${fileId}`);
            this._logger.info(`請求 GET ${moduleUrl}`);
            const response = yield got_1.default.get(moduleUrl, { responseType: "json" });
            if (response.statusCode !== 200 || response.body === undefined) {
                this._logger.error(`請求失敗 GET ${moduleUrl}`);
                throw new Error("Get module failure.");
            }
            ;
            this._logger.info(`成功請求 GET ${moduleUrl}`);
            const moduleInfo = response.body.data;
            return {
                name: moduleInfo.displayName,
                type: module.type,
                action: module.action,
                projectId: projectId,
                fileId: fileId,
                fileName: moduleInfo.fileName,
                filePath: path.join(this._serverInstanceDir, ".minecraft", "mods", moduleInfo.fileName),
                sha1: "",
                size: 0,
                version: "",
                download: {
                    url: moduleInfo.downloadUrl
                },
                userRevert: false
            };
        });
    }
}
exports.default = ModuleHandler;
//# sourceMappingURL=ModuleHandler.js.map