import * as path from "path";

import ModuleHandler from "../modpack/ModuleHandler";
import IModule from "../../interfaces/IModule";
import IServerHandler from "../../interfaces/IServerHandler";
import ApiFileService from "../api/ApiFileService";
import GlobalPath from "../io/GlobalPath";
import ForgeHandler from "../modLoaders/forge/ForgeHandler";
import ModpackHandler from "../modpack/ModpackHandler";

export default class ServerLauncherJsonHandler {

    private _serverId: string;
    private _commandDirPath: string;
    private _serverInstanceDir: string;

    constructor(serverId: string) {
        this._serverId = serverId;
        this._commandDirPath = GlobalPath.getCommonDirPath();
        this._serverInstanceDir = path.join(GlobalPath.getInstancesDirPath(), serverId);
    }

    public serverJsonHandlerDataHandler(): Promise<IServerHandler | undefined> {
        return new Promise<IServerHandler | undefined>(async (resolve, reject) => {

            const serverLauncherJsonObjects = await ApiFileService.getLauncherAssetsParser(this._serverId);

            const javaJsonObjects = {
                version: serverLauncherJsonObjects.javaVersion,
                runtimeJavaDirPath: "",
                download: {
                    fileName: serverLauncherJsonObjects.javaFileName,
                    url: serverLauncherJsonObjects.javaDownloadUrl
                }
            };

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

                    modpackData = await new ModpackHandler(this._serverId, modpackInstance).modpackHandler();
                }

                const modpackModules = modpackData !== undefined ? modpackData.modules : new Array<IModule>();
                const moduleData = await new ModuleHandler(this._serverInstanceDir).moduleHandler(serverLauncherJsonObjects.modules, modpackModules, new Array<IModule>()); // TODO: new Array<IModule>()

                if (modLoadersData === undefined) {
                    return reject(new Error("Undefined modLoadersData!"));
                }

                if (moduleData === undefined) {
                    return reject(new Error("Undefined modulesData!"));
                }

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