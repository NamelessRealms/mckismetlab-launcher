import got from "got";
import * as path from "path";

import IModule from "../../interfaces/IModule";
import { IModuleHandlerReturn } from "../../interfaces/IModuleHandlerReturn";

export default class ModuleHandler {
    private _serverInstanceDir;

    constructor(serverInstanceDir: string) {
        this._serverInstanceDir = serverInstanceDir;
    }

    public moduleHandler(launcherAssetsModules: Array<{
        name: string;
        version: string;
        type: string;
        action: string;
        projectId: number;
        fileId: number;
    }>, modpackModules: Array<IModule>, localModules: Array<IModule>): Promise<IModuleHandlerReturn> {
        return new Promise(async (resolve) => {

            let moduleData = {
                ADD: new Array<IModule>(),
                REMOVE: new Array<IModule>(),
                modules: new Array<IModule>(),
                size: 0
            }

            for (let launcherAssetsModule of launcherAssetsModules) {

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

            return resolve(moduleData);
        });
    }

    public modulesInfo(modules: Array<{ projectID: number, fileID: number, required: boolean }>): Promise<Array<IModule>> {
        return new Promise<Array<IModule>>(async (resolve) => {

            const modulesData = new Array<IModule>();

            for (let module of modules) {

                let moduleInfo = await this._moduleInfo({
                    name: "",
                    type: "CurseForge",
                    action: "ADD",
                    projectId: module.projectID,
                    fileId: module.fileID
                });

                // console.log(moduleInfo);

                modulesData.push(moduleInfo);
            }

            return resolve(modulesData);
        });
    }

    private _moduleInfo(module: { name: string, type: string, action: string, projectId: number, fileId: number }): Promise<IModule> {
        return new Promise<IModule>(async (resolve, reject) => {

            const projectId = module.projectId;
            const fileId = module.fileId;
            const downloadUrl = `https://addons-ecs.forgesvc.net/api/v2/addon/${projectId}/file/${fileId}`;
            const response = await got.get<any>(downloadUrl);

            if (response.statusCode !== 200 || response.body === undefined) return reject();

            const moduleInfo = JSON.parse(response.body);

            return resolve({
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
            });
        });
    }
}