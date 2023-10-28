"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ForgeHandler_1 = require("./forge/ForgeHandler");
const FabricHandler_1 = require("./fabric/FabricHandler");
const LoggerUtil_1 = require("../utils/LoggerUtil");
class ModLoaderHeaders {
    constructor(serverId, mojangVersion, progressManager) {
        this._logger = new LoggerUtil_1.default("ModLoaderHeaders");
        this._serverId = serverId;
        this._mojangVersion = mojangVersion;
        this._progressManager = progressManager;
    }
    getModLoaderAssets(modLoaderId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let modLoaderAssets = null;
            const modLoaderType = this._getModLoaderType(modLoaderId);
            if (modLoaderType === "unknown")
                throw new Error("modLoaderType is unknown.");
            this._logger.info(`modLoader id: ${modLoaderId}`);
            this._logger.info(`modLoader type: ${modLoaderType}`);
            if (modLoaderType === "Forge") {
                modLoaderAssets = yield new ForgeHandler_1.default(this._serverId, this._mojangVersion, modLoaderId, this._progressManager).forgeHandlerParser();
            }
            else if (modLoaderType === "Fabric") {
                modLoaderAssets = yield new FabricHandler_1.default(this._serverId, this._mojangVersion, modLoaderId, this._progressManager).fabricHandlerParser();
            }
            if (modLoaderAssets === null)
                throw new Error("modLoaderAssets not null.");
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
            if (modLoaderType === "Forge") {
                return Object.assign(modLoaderAssetsBase, {
                    forge: {
                        isInstall: modLoaderAssets.isInstall,
                        versionJsonObject: modLoaderAssets.versionJsonObject,
                        installProfile: modLoaderAssets.installProfile
                    }
                });
            }
            else if (modLoaderType === "Fabric") {
                return Object.assign(modLoaderAssetsBase, {
                    fabric: {
                        versionJsonObject: modLoaderAssets.versionJsonObject
                    }
                });
            }
            else {
                throw new Error("getModLoaderAssets not return.");
            }
        });
    }
    _getModLoaderType(id) {
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
exports.default = ModLoaderHeaders;
//# sourceMappingURL=ModLoader.js.map