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

    constructor(serverInstanceDir: string, serverId: string) {
        this._serverInstanceDir = serverInstanceDir;
        this._serverId = serverId;
    }

    public async moduleHandler(launcherAssetsModules: Array<{
        name: string;
        version: string;
        type: string;
        action: string;
        projectId: number;
        fileId: number;
    }>, modpackModules: Array<IModule>, localModules: Array<IModule>, progressManager?: ProgressManager): Promise<IModuleHandlerReturn> {

        let moduleData = {
            ADD: new Array<IModule>(),
            REMOVE: new Array<IModule>(),
            modules: new Array<IModule>(),
            size: 0
        }

        for (let i = 0; i < launcherAssetsModules.length; i++) {

            const launcherAssetsModule = launcherAssetsModules[i];

            if (progressManager !== undefined) {
                progressManager.set(ProgressTypeEnum.processModulesData, i, launcherAssetsModules.length - 1);
            }
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

                        modpackModules = modpackModules.filter(item => item.projectId !== launcherAssetsModule.projectId);
                        moduleData.REMOVE.push(module);

                        break;
                }

            }
        }

        for (let modpackModule of modpackModules) {
            const isLocalModule = localModules.find(item => item.projectId === modpackModule.projectId && item.fileId === modpackModule.fileId);
            if (isLocalModule === undefined) {
                localModules.push(modpackModule);
                moduleData.ADD.push(modpackModule);
            }
        }

        moduleData.modules = localModules;
        moduleData.size = localModules.length;

        return moduleData;
    }

    public async modulesInfo(modules: Array<{ projectID: number, fileID: number, required: boolean }>, progressManager?: ProgressManager): Promise<Array<IModule>> {

        const modulesData = new Array<IModule>();

        for (let i = 0; i < modules.length; i++) {

            const module = modules[i];

            if (progressManager !== undefined) {
                progressManager.set(ProgressTypeEnum.getModpackModulesInfo, i, modules.length - 1);
            }

            let moduleInfo = await this._moduleInfo({
                name: "",
                type: "CurseForge",
                action: "ADD",
                projectId: module.projectID,
                fileId: module.fileID
            });

            modulesData.push(moduleInfo);

            // stop
            ProcessStop.isThrowProcessStopped(this._serverId);
        }

        return modulesData;
    }

    private async _moduleInfo(module: { name: string, type: string, action: string, projectId: number, fileId: number }): Promise<IModule> {

        const projectId = module.projectId;
        const fileId = module.fileId;
        const downloadUrl = `https://addons-ecs.forgesvc.net/api/v2/addon/${projectId}/file/${fileId}`;
        const response = await got.get<any>(downloadUrl);

        if (response.statusCode !== 200 || response.body === undefined) throw new Error("Get module failure.");

        const moduleInfo = JSON.parse(response.body);

        return {
            name: moduleInfo.displayName,
            type: module.type,
            action: module.action,
            projectId: projectId,
            fileId: fileId,
            fileName: moduleInfo.fileName,
            filePath: path.join(this._serverInstanceDir, ".minecraft", "mods", moduleInfo.fileName),
            download: {
                url: moduleInfo.downloadUrl
            }
        };
    }
}