import * as path from "path";

import ModuleHandler from "../modpack/ModuleHandler";
import IModule from "../../interfaces/IModule";
import IServerLauncherReturn from "../../interfaces/IServerLauncherReturn";
import ApiFileService from "../../api/ApiFileService";
import GlobalPath from "../io/GlobalPath";
import ForgeHandler from "../modLoaders/forge/ForgeHandler";
import ModpackHandler from "../modpack/ModpackHandler";
import InstanceIo from "../io/InstanceIo";

export default class ServerLauncherJsonHandler {

    private _serverId: string;
    private _serverInstanceDir: string;
    private _commandDirPath: string;
    private _instanceIo: InstanceIo;

    constructor(serverId: string, instanceIo: InstanceIo) {
        this._serverId = serverId;
        this._serverInstanceDir = path.join(GlobalPath.getInstancesDirPath(), serverId);
        this._instanceIo = instanceIo;
        this._commandDirPath = GlobalPath.getCommonDirPath();
    }

    public serverJsonHandlerDataHandler(): Promise<IServerLauncherReturn | undefined> {
        return new Promise<IServerLauncherReturn | undefined>(async (resolve, reject) => {

            const serverLauncherJsonObjects = await ApiFileService.getLauncherAssetsParser(this._serverId);

            const javaJsonObjects = {
                version: serverLauncherJsonObjects.javaVersion,
                download: {
                    fileName: serverLauncherJsonObjects.javaFileName,
                    url: serverLauncherJsonObjects.javaDownloadUrl
                }
            };

            this._instanceIo.setMinecraftVersion(serverLauncherJsonObjects.minecraftVersion);

            if (serverLauncherJsonObjects.minecraftType === "minecraftVanilla") {
                return resolve({
                    id: serverLauncherJsonObjects.id,
                    java: javaJsonObjects,
                    modLoaders: undefined,
                    modules: undefined,
                    minecraftVersion: serverLauncherJsonObjects.minecraftVersion,
                    minecraftType: serverLauncherJsonObjects.minecraftType
                });
            }

            if (serverLauncherJsonObjects.minecraftType === "minecraftModules" || serverLauncherJsonObjects.minecraftType === "minecraftModpack") {

                const forgeInstanceObjects = {
                    version: serverLauncherJsonObjects.modLoadersVersion,
                    downloadUrl: serverLauncherJsonObjects.modLoadersUrl
                }

                const modLoadersData = await new ForgeHandler(this._serverId, serverLauncherJsonObjects.minecraftVersion, forgeInstanceObjects).forgeHandlerParser();

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

                    modpackData = await new ModpackHandler(this._serverId, this._instanceIo, modpackInstance).modpackHandler();

                    this._instanceIo.setModpackName(modpackData.modpack.name);
                    this._instanceIo.setModpackProjectId(modpackData.modpack.projectId);
                    this._instanceIo.setModpackFileId(modpackData.modpack.fileId);
                    this._instanceIo.setModpackVersion(modpackData.modpack.version);
                }

                const modpackModules = modpackData !== undefined ? modpackData.modules : new Array<IModule>();
                const moduleData = await new ModuleHandler(this._serverInstanceDir).moduleHandler(serverLauncherJsonObjects.modules, modpackModules, this._instanceIo.getModules());

                this._instanceIo.setModules(moduleData.modules);

                if (modLoadersData === undefined) {
                    return reject(new Error("Undefined modLoadersData!"));
                }

                this._instanceIo.setModLoadersType(modLoadersData.modLoadersType);
                this._instanceIo.setModLoadersVersion(modLoadersData.forgeVersion);

                // save server instance.json
                this._instanceIo.save();

                return resolve({
                    id: serverLauncherJsonObjects.id,
                    java: javaJsonObjects,
                    modLoaders: modLoadersData,
                    modules: moduleData,
                    minecraftVersion: serverLauncherJsonObjects.minecraftVersion,
                    minecraftType: serverLauncherJsonObjects.minecraftType
                });
            }

            return resolve(undefined);
        });
    }
}