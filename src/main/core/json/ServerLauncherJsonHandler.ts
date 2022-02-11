import * as path from "path";

import ModuleHandler from "../modpack/ModuleHandler";
import IModule from "../../interfaces/IModule";
import IServerLauncherReturn from "../../interfaces/IServerLauncherReturn";
import ApiFileService from "../../api/ApiFileService";
import GlobalPath from "../io/GlobalPath";
import ForgeHandler from "../modLoaders/forge/ForgeHandler";
import ModpackHandler from "../modpack/ModpackHandler";
import InstanceIo from "../io/InstanceIo";
import ProgressManager from "../utils/ProgressManager";
import { ProgressTypeEnum } from "../../enums/ProgressTypeEnum";
import { ProcessStop, Stop } from "../utils/ProcessStop";

export default class ServerLauncherJsonHandler {

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

    public async serverJsonHandlerDataHandler(): Promise<IServerLauncherReturn | null> {

        this._progressManager.set(ProgressTypeEnum.initJsonData, 1, 2);
        const serverLauncherJsonObjects = await ApiFileService.getLauncherAssetsParser(this._serverId);
        this._progressManager.set(ProgressTypeEnum.initJsonData, 2, 2);

            const javaJsonObjects = {
                version: serverLauncherJsonObjects.javaVersion,
                download: {
                    fileName: serverLauncherJsonObjects.javaFileName,
                    url: serverLauncherJsonObjects.javaDownloadUrl
                }
            };

            this._instanceIo.setMinecraftVersion(serverLauncherJsonObjects.minecraftVersion);

            if (serverLauncherJsonObjects.minecraftType === "minecraftVanilla") {
                return {
                    id: serverLauncherJsonObjects.id,
                    java: javaJsonObjects,
                    modLoaders: undefined,
                    modules: undefined,
                    minecraftVersion: serverLauncherJsonObjects.minecraftVersion,
                    minecraftType: serverLauncherJsonObjects.minecraftType
                };
            }

            if (serverLauncherJsonObjects.minecraftType === "minecraftModules" || serverLauncherJsonObjects.minecraftType === "minecraftModpack") {

                const forgeInstanceObjects = {
                    version: serverLauncherJsonObjects.modLoadersVersion,
                    downloadUrl: serverLauncherJsonObjects.modLoadersUrl
                }

                const modLoadersData = await new ForgeHandler(this._serverId, serverLauncherJsonObjects.minecraftVersion, forgeInstanceObjects, this._progressManager).forgeHandlerParser();
                ProcessStop.isThrowProcessStopped(this._serverId);

                let modpackData: {
                    modpack: {
                        name: string;
                        version: string;
                        projectId: number;
                        fileId: number;
                    };
                    modules: Array<IModule>
                } | undefined;

                if (serverLauncherJsonObjects.minecraftType === "minecraftModpack") {

                    const modpackInstance = {
                        type: serverLauncherJsonObjects.modpackType,
                        name: serverLauncherJsonObjects.modpackName,
                        version: serverLauncherJsonObjects.modpackVersion,
                        projectId: serverLauncherJsonObjects.modpackProjectId,
                        fileId: serverLauncherJsonObjects.modpackFileId,
                        downloadUrl: serverLauncherJsonObjects.modpackUrl
                    }

                    modpackData = await new ModpackHandler(this._serverId, this._instanceIo, modpackInstance, this._progressManager).modpackHandler();

                    this._instanceIo.setModpackName(modpackData.modpack.name);
                    this._instanceIo.setModpackProjectId(modpackData.modpack.projectId);
                    this._instanceIo.setModpackFileId(modpackData.modpack.fileId);
                    this._instanceIo.setModpackVersion(modpackData.modpack.version);
                }

                const modpackModules = modpackData !== undefined ? modpackData.modules : new Array<IModule>();
                const moduleData = await new ModuleHandler(this._serverInstanceDir, this._serverId).moduleHandler(serverLauncherJsonObjects.modules, modpackModules, this._instanceIo.getModules());

                this._instanceIo.setModules(moduleData.modules);

                if (modLoadersData === undefined) {
                    throw new Error("modLoadersData not null.");
                }

                this._instanceIo.setModLoadersType(modLoadersData.modLoadersType);
                this._instanceIo.setModLoadersVersion(modLoadersData.forgeVersion);

                // save server instance.json
                this._instanceIo.save();

                this._progressManager.set(ProgressTypeEnum.processModulesData, 5, 5);
                return {
                    id: serverLauncherJsonObjects.id,
                    java: javaJsonObjects,
                    modLoaders: modLoadersData,
                    modules: moduleData,
                    minecraftVersion: serverLauncherJsonObjects.minecraftVersion,
                    minecraftType: serverLauncherJsonObjects.minecraftType
                };
            }

            return null;
    }
}