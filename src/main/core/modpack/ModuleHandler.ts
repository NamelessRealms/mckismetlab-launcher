import got from "got";
import * as path from "path";

import IModule from "../../interfaces/IModule";
import ProgressManager from "../utils/ProgressManager";
import { IModuleHandlerReturn } from "../../interfaces/IModuleHandlerReturn";
import { ProgressTypeEnum } from "../../enums/ProgressTypeEnum";
import { ProcessStop, Stop } from "../utils/ProcessStop";

export default class ModuleHandler {
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
    }>, modpackModuleData: { type: "Revise" | "CurseForge" | "FTB", modules: Array<IModule> } , localModules: Array<IModule>): Promise<IModuleHandlerReturn> {

        let modpackModules = modpackModuleData.modules;

        let moduleData = {
            ADD: new Array<IModule>(),
            REMOVE: new Array<IModule>(),
            modules: new Array<IModule>(),
            size: 0
        }

        for (let i = 0; i < launcherAssetsModules.length; i++) {

            const launcherAssetsModule = launcherAssetsModules[i];

            this._progressManager.set(ProgressTypeEnum.processModulesData, i, launcherAssetsModules.length - 1);
            // stop
            ProcessStop.isThrowProcessStopped(this._serverId);

            const isLocalModule = localModules.find(item => item.projectId === launcherAssetsModule.projectId && item.fileId === launcherAssetsModule.fileId);

            if (isLocalModule === undefined) {

                let module = await this._moduleInfo(launcherAssetsModule);

                switch (launcherAssetsModule.action) {
                    case "ADD":

                        moduleData.ADD.push(module);
                        localModules.push(module);

                        break;
                    case "REMOVE":

                        // TODO: ftb no remove
                        modpackModules = modpackModules.filter(item => item.projectId !== launcherAssetsModule.projectId);
                        moduleData.REMOVE.push(module);

                        break;
                }

            }
        }

        for(let modpackModule of modpackModules) {
            if (this._isLocalModule(modpackModuleData.type, localModules, modpackModule)) {
                localModules.push(modpackModule);
                moduleData.ADD.push(modpackModule);
            }
        }

        moduleData.modules = localModules;
        moduleData.size = localModules.length;

        return moduleData;
    }

    private _isLocalModule(modpackType: "Revise" | "CurseForge" | "FTB", localModules: Array<IModule>, modpackModule: IModule): boolean {

        if(localModules.length <= 0) return true;

        if(modpackType === "FTB") {

            for(let localModule of localModules) {
                if(localModule.fileName === modpackModule.fileName) return false;
            }

            return true;
        }

        for(let localModule of localModules) {
            if(localModule.projectId === modpackModule.projectId && localModule.fileId === modpackModule.fileId) return false;
        }

        return true;
    }

    public async getModulesInfo(modules: Array<{ projectID: number, fileID: number, required: boolean }>): Promise<Array<IModule>> {

        const modulesData = new Array<IModule>();

        for (let i = 0; i < modules.length; i++) {

            const module = modules[i];

            let moduleInfo = await this._moduleInfo({
                name: "",
                type: "CurseForge",
                action: "ADD",
                projectId: module.projectID,
                fileId: module.fileID
            });

            modulesData.push(moduleInfo);

            this._progressManager.set(ProgressTypeEnum.getModpackModulesInfo, i, modules.length - 1);
            // stop
            ProcessStop.isThrowProcessStopped(this._serverId);
        }

        return modulesData;
    }

    private async _moduleInfo(module: { name: string, type: string, action: string, projectId: number, fileId: number }): Promise<IModule> {

        const projectId = module.projectId;
        const fileId = module.fileId;
        const downloadUrl = `https://addons-ecs.forgesvc.net/api/v2/addon/${projectId}/file/${fileId}`;
        const response = await got.get<any>(downloadUrl, { responseType: "json" });

        if (response.statusCode !== 200 || response.body === undefined) throw new Error("Get module failure.");

        const moduleInfo = response.body;

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
            }
        };
    }
}