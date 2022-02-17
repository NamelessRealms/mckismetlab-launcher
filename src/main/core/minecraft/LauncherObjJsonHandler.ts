import * as path from "path";

import ModuleHandler from "../modpack/ModuleHandler";
import IModule from "../../interfaces/IModule";
import IServerLauncherReturn from "../../interfaces/IServerLauncherReturn";
import ApiFileService from "../../api/ApiFileService";
import GlobalPath from "../io/GlobalPath";
import ModpackHandler from "../modpack/ModpackHandler";
import InstanceIo from "../io/InstanceIo";
import ProgressManager from "../utils/ProgressManager";
import { ProgressTypeEnum } from "../../enums/ProgressTypeEnum";
import { ProcessStop } from "../utils/ProcessStop";
import ModLoaderHeaders from "../modLoader/ModLoader";

interface IModpackAssets {
    isModpackReplace: boolean;
    modpackType: "Revise" | "CurseForge" | "FTB"
    modpack: {
        name: string;
        version: string;
        projectId: number;
        fileId: number;
    };
    modLoaderId: string;
    modules: Array<IModule>;
    files?: Array<{ fileName: string, filePath: string, sha1: string, size: number, download: { url: string } }>;
}

export default class LauncherObjsJsonHandler {

    private _serverId: string;
    private _serverInstanceDir: string;
    private _instanceIo: InstanceIo;
    private _progressManager: ProgressManager;

    constructor(serverId: string, instanceIo: InstanceIo, progressManager: ProgressManager) {
        this._serverId = serverId;
        this._serverInstanceDir = path.join(GlobalPath.getInstancesDirPath(), serverId);
        this._instanceIo = instanceIo;
        this._progressManager = progressManager;
    }

    public async serverObjsJsonDHandler(): Promise<IServerLauncherReturn> {

        let serverLauncherReturn: IServerLauncherReturn | null = null;

        this._progressManager.set(ProgressTypeEnum.initJsonData, 1, 2);
        const launcherAssetsParser = await ApiFileService.getLauncherAssetsParser(this._serverId);
        this._progressManager.set(ProgressTypeEnum.initJsonData, 2, 2);

        const baseServerAssets = {
            id: launcherAssetsParser.getId(),
            minecraftVersion: launcherAssetsParser.getMinecraftVersion(),
            minecraftType: launcherAssetsParser.getMinecraftType(),
            javaVM: {
                version: launcherAssetsParser.getJavaVMVersion(),
                download: {
                    fileName: launcherAssetsParser.getJavaVMFileName(),
                    url: launcherAssetsParser.getJavaVMDownloadUrl()
                }
            }
        }

        if (launcherAssetsParser.getMinecraftType() === "minecraftVanilla") {
            serverLauncherReturn = Object.assign(baseServerAssets, {
                modLoader: null,
                module: null,
                modpack: null
            });
        }

        if (launcherAssetsParser.getMinecraftType() === "minecraftModules" || launcherAssetsParser.getMinecraftType() === "minecraftModpack") {

            let modpackAssets: IModpackAssets | null = null;

            if (launcherAssetsParser.getMinecraftType() === "minecraftModpack") {
                // headers modpack
                modpackAssets = await new ModpackHandler(this._serverId, this._instanceIo, launcherAssetsParser.getModpackData(), this._progressManager).getModpackAssetsHandler();
                this._instanceIo.setModpackName(modpackAssets.modpack.name);
                this._instanceIo.setModpackProjectId(modpackAssets.modpack.projectId);
                this._instanceIo.setModpackFileId(modpackAssets.modpack.fileId);
                this._instanceIo.setModpackVersion(modpackAssets.modpack.version);

                if(modpackAssets.isModpackReplace) {
                    this._instanceIo.setModpackFtbFiles(new Array());
                    this._instanceIo.setModules(new Array());
                }

                // save modpack files assets
                if(modpackAssets.modpackType === "FTB") {
                    if(modpackAssets.files === undefined) throw new Error("modpackAssets 'files' not null.");
                    this._instanceIo.setModpackFtbFiles(modpackAssets.files);
                } else {
                    this._instanceIo.setModpackFtbFiles(new Array());
                }
            }

            // headers modules
            const modpackModules = modpackAssets !== null ? modpackAssets.modules : new Array<IModule>();
            const moduleAssets = await new ModuleHandler(this._serverInstanceDir, this._serverId, this._progressManager).getModuleAssetHandler(launcherAssetsParser.getModules(), { type: modpackAssets !== null ? modpackAssets.modpackType : "CurseForge", modules: modpackModules }, this._instanceIo.getModules());
            this._instanceIo.setModules(moduleAssets.modules);

            // headers modLoader
            const modLoaderId = modpackAssets !== null ? modpackAssets.modLoaderId : launcherAssetsParser.getModLoadersId();
            const modLoaderAssets = await new ModLoaderHeaders(this._serverId, launcherAssetsParser.getMinecraftVersion(), this._progressManager).getModLoaderAssets(modLoaderId);
            this._instanceIo.setModLoaderId(modLoaderId);
            this._instanceIo.setModLoaderType(modLoaderAssets.modLoaderType);
            this._instanceIo.setModLoaderVersion(modLoaderAssets.version);
            ProcessStop.isThrowProcessStopped(this._serverId);

            this._progressManager.set(ProgressTypeEnum.processModulesData, 5, 5);
            serverLauncherReturn = Object.assign(baseServerAssets, {
                modpack: this._getModpackAssets(modpackAssets),
                modLoader: modLoaderAssets,
                module: moduleAssets
            });

            // test
            // console.log(this._instanceIo.getModpackFtbFiles());
            // console.log(this._instanceIo.getModules());
            
            this._instanceIo.setMinecraftVersion(launcherAssetsParser.getMinecraftVersion());
            // save server instance.json
            this._instanceIo.save();
        }

        if (serverLauncherReturn === null) throw new Error("serverLauncherReturn not null.");

        return serverLauncherReturn;
    }

    private _getModpackAssets(modpackAssets: IModpackAssets | null): { type: "Revise" | "CurseForge" | "FTB", files?: Array<{ fileName: string, filePath: string, sha1: string, size: number, download: { url: string } }> } | null {

        if(modpackAssets === null) {
            return null;
        }

        if(modpackAssets.modpackType === "FTB") {
            return {
                type: "FTB",
                files: modpackAssets.files
            }
        }

        return {
            type: modpackAssets.modpackType
        }
    }
}