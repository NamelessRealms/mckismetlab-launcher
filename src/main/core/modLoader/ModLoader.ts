import IModLoader from "../../interfaces/IModLoader";
import IForgeAssets from "../../interfaces/IForgeAssets";
import ProgressManager from "../utils/ProgressManager";
import ForgeHandler from "./forge/ForgeHandler";
import FabricHandler from "./fabric/FabricHandler";
import IFabricAssets from "../../interfaces/IFabricAssets";
import LoggerUtil from "../utils/LoggerUtil";

export default class ModLoaderHeaders {

    private _logger: LoggerUtil = new LoggerUtil("ModLoaderHeaders");
    private _serverId: string;
    private _mojangVersion: string;
    private _progressManager: ProgressManager;

    constructor(serverId: string, mojangVersion: string, progressManager: ProgressManager) {
        this._serverId = serverId;
        this._mojangVersion = mojangVersion;
        this._progressManager = progressManager;
    }

    public async getModLoaderAssets(modLoaderId: string): Promise<IModLoader> {

        let modLoaderAssets: IForgeAssets | IFabricAssets | null = null;

        const modLoaderType = this._getModLoaderType(modLoaderId);
        if(modLoaderType === "unknown") throw new Error("modLoaderType is unknown.");

        this._logger.info(`modLoader id: ${modLoaderId}`);
        this._logger.info(`modLoader type: ${modLoaderType}`);

        if(modLoaderType === "Forge") {
            modLoaderAssets = await new ForgeHandler(this._serverId, this._mojangVersion, modLoaderId, this._progressManager).forgeHandlerParser();
        } else if(modLoaderType === "Fabric") {
            modLoaderAssets = await new FabricHandler(this._serverId, this._mojangVersion, modLoaderId, this._progressManager).fabricHandlerParser();
        }

        if(modLoaderAssets === null) throw new Error("modLoaderAssets not null.");

        this._logger.info(`modLoader mainClass: ${modLoaderAssets.mainClass}`);
        this._logger.info(`modLoader version: ${modLoaderAssets.version}`);

        const modLoaderAssetsBase = {
            modLoaderType: modLoaderType,
            version: modLoaderAssets.version,
            startArguments: {
                arguments: modLoaderAssets.arguments,
                mainClass: modLoaderAssets.mainClass,
                libraries: modLoaderAssets.libraries
            }
        };

        if(modLoaderType === "Forge") {

            return Object.assign(modLoaderAssetsBase, {
                forge: {
                    isInstall: (modLoaderAssets as IForgeAssets).isInstall,
                    versionJsonObject: (modLoaderAssets as IForgeAssets).versionJsonObject,
                    installProfile: (modLoaderAssets as IForgeAssets).installProfile
                }
            });

        } else if (modLoaderType === "Fabric") {

            return Object.assign(modLoaderAssetsBase, {
                fabric: {
                    versionJsonObject: (modLoaderAssets as IFabricAssets).versionJsonObject
                }
            });

        } else {
            throw new Error("getModLoaderAssets not return.");
        }
    }

    private _getModLoaderType(id: string): "Forge" | "Fabric" | "unknown" {
        switch (id.split("-")[0]) {
            case "forge":
                return "Forge";
            case "fabric":
                return "Fabric";
            default:
                return "unknown";
        }
    }
}