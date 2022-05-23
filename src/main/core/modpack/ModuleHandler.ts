import got from "got";
import * as path from "path";

import IModule from "../../interfaces/IModule";
import ProgressManager from "../utils/ProgressManager";
import { IModuleHandlerReturn } from "../../interfaces/IModuleHandlerReturn";
import { ProgressTypeEnum } from "../../enums/ProgressTypeEnum";
import { ProcessStop, Stop } from "../utils/ProcessStop";
import LoggerUtil from "../utils/LoggerUtil";
import Config from "../../config/Configs";
import Utils from "../../core/utils/Utils";

export default class ModuleHandler {

    private _logger: LoggerUtil = new LoggerUtil("ModuleHandler");
    private _serverInstanceDir;
    private _serverId: string;
    private _progressManager: ProgressManager;

    constructor(serverInstanceDir: string, serverId: string, ProgressManager: ProgressManager) {
        this._serverInstanceDir = serverInstanceDir;
        this._serverId = serverId;
        this._progressManager = ProgressManager;
    }

    public async getModuleAssetHandler(launcherAssetsModules: Array<{
        name: string;
        version: string;
        type: string;
        action: string;
        projectId: number;
        fileId: number;
    }>, modpackModuleData: { type: "Revise" | "CurseForge" | "FTB", modules: Array<IModule> }, localModules: Array<IModule>): Promise<IModuleHandlerReturn> {

        let modpackModules = modpackModuleData.modules;

        let moduleData = {
            ADD: new Array<IModule>(),
            REMOVE: new Array<IModule>(),
            modules: new Array<IModule>(),
            size: 0
        }

        this._logger.info(`launcher assets modules length: ${launcherAssetsModules.length}`);

        for (let i = 0; i < launcherAssetsModules.length; i++) {

            const launcherAssetsModule = launcherAssetsModules[i];

            this._progressManager.set(ProgressTypeEnum.processModulesData, i, launcherAssetsModules.length - 1);
            // stop
            ProcessStop.isThrowProcessStopped(this._serverId);

            // this._logger.info(`launcher module name: ${launcherAssetsModule.name} projectId: ${launcherAssetsModule.projectId} fileId: ${launcherAssetsModule.fileId}`);

            const isLocalModule = localModules.find(item => item.projectId === launcherAssetsModule.projectId && item.fileId === launcherAssetsModule.fileId);

            // this._logger.info(`launcher assets 檢查模組是否安裝到本地 -> ${isLocalModule === undefined ? false : true}`);

            if (isLocalModule === undefined) {

                let module = await this._moduleInfo(launcherAssetsModule);

                this._logger.info(`Action: ${launcherAssetsModule.action}`);

                switch (launcherAssetsModule.action) {
                    case "ADD":

                        moduleData.ADD.push(module);
                        localModules.push(module);

                        break;
                    case "REMOVE":

                        if (modpackModuleData.type === "FTB") {
                            modpackModules = modpackModules.filter(item => item.fileName !== module.fileName);
                        } else {
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
    }

    private _isLocalModule(modpackType: "Revise" | "CurseForge" | "FTB", localModules: Array<IModule>, modpackModule: IModule): boolean {

        if (localModules.length <= 0) return true;

        if (modpackType === "FTB") {

            for (let localModule of localModules) {
                if (localModule.fileName === modpackModule.fileName) return false;
            }

            return true;
        }

        for (let localModule of localModules) {
            if (localModule.projectId === modpackModule.projectId && localModule.fileId === modpackModule.fileId) return false;
        }

        return true;
    }

    public async getModulesInfo(modules: Array<{ projectID: number, fileID: number, required: boolean }>): Promise<Array<IModule>> {

        const moduleUrl = `${Config.apiUrl}/mods/files`;
        const modulesData = new Array<IModule>();
        const filesIds = new Array<number>();

        for (let module of modules) {
            filesIds.push(module.fileID);
        }

        this._logger.info(`請求 GET ${moduleUrl}`);

        const moduleResponse = await got.post<any>(moduleUrl, {
            responseType: "json",
            json: {
                fileIds: filesIds
            }
        });

        if (moduleResponse.statusCode !== 200 || moduleResponse.body === undefined) {
            this._logger.error(`請求失敗 GET ${moduleUrl}`);
            throw new Error("Get modules failure.")
        };

        this._logger.info(`成功請求 GET ${moduleUrl}`);

        // stop
        ProcessStop.isThrowProcessStopped(this._serverId);

        for (let module of moduleResponse.body.data) {

            // Flx curseforge api downloadUrl null issues
            if (module.downloadUrl === null) {
                this._logger.warn(module.displayName);
                module.downloadUrl = Utils.flxCurseforgeDownloadUrlNullIssues(module.id, module.fileName);
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
    }

    private async _moduleInfo(module: { name: string, type: string, action: string, projectId: number, fileId: number }): Promise<IModule> {

        const projectId = module.projectId;
        const fileId = module.fileId;
        // const moduleUrl = `https://addons-ecs.forgesvc.net/api/v2/addon/${projectId}/file/${fileId}`;
        const moduleUrl = `${Config.apiUrl}/mods/${projectId}/file/${fileId}`;

        this._logger.info(`module projectId: ${projectId} fileId: ${fileId}`);
        this._logger.info(`請求 GET ${moduleUrl}`);

        const response = await got.get<any>(moduleUrl, { responseType: "json" });

        if (response.statusCode !== 200 || response.body === undefined) {
            this._logger.error(`請求失敗 GET ${moduleUrl}`);
            throw new Error("Get module failure.")
        };

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
    }
}