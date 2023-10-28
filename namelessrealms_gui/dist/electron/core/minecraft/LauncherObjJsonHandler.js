"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = require("path");
const ModuleHandler_1 = require("../modpack/ModuleHandler");
const ApiFileService_1 = require("../../api/ApiFileService");
const GlobalPath_1 = require("../io/GlobalPath");
const ModpackHandler_1 = require("../modpack/ModpackHandler");
const ProgressTypeEnum_1 = require("../../enums/ProgressTypeEnum");
const ProcessStop_1 = require("../utils/ProcessStop");
const ModLoader_1 = require("../modLoader/ModLoader");
const LoggerUtil_1 = require("../utils/LoggerUtil");
class LauncherObjsJsonHandler {
    constructor(serverId, instanceIo, progressManager) {
        this._logger = new LoggerUtil_1.default("LauncherObjsJsonHandler");
        this._serverId = serverId;
        this._serverInstanceDir = path.join(GlobalPath_1.default.getInstancesDirPath(), serverId);
        this._instanceStore = instanceIo;
        this._progressManager = progressManager;
    }
    serverObjsJsonDHandler() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let serverLauncherAssets = null;
            this._progressManager.set(ProgressTypeEnum_1.ProgressTypeEnum.initJsonData, 1, 2);
            const launcherAssetsParser = yield ApiFileService_1.default.getLauncherAssetsParser(this._serverId);
            this._progressManager.set(ProgressTypeEnum_1.ProgressTypeEnum.initJsonData, 2, 2);
            this._logger.info(`minecraft type: ${launcherAssetsParser.getMinecraftType()}`);
            this._logger.info(`minecraft version: ${launcherAssetsParser.getMinecraftVersion()}`);
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
            };
            if (launcherAssetsParser.getMinecraftType() === "minecraftVanilla") {
                serverLauncherAssets = Object.assign(baseServerAssets, {
                    modLoader: null,
                    module: null,
                    modpack: null
                });
            }
            if (launcherAssetsParser.getMinecraftType() === "minecraftModules" || launcherAssetsParser.getMinecraftType() === "minecraftModpack") {
                let modpackAssets = null;
                if (launcherAssetsParser.getMinecraftType() === "minecraftModpack") {
                    // headers modpack
                    modpackAssets = yield new ModpackHandler_1.default(this._serverId, this._instanceStore, launcherAssetsParser.getModpackData(), this._progressManager).getModpackAssetsHandler();
                    this._instanceStore.setModpackName(modpackAssets.modpack.name);
                    this._instanceStore.setModpackProjectId(modpackAssets.modpack.projectId);
                    this._instanceStore.setModpackFileId(modpackAssets.modpack.fileId);
                    this._instanceStore.setModpackVersion(modpackAssets.modpack.version);
                    if (modpackAssets.isModpackReplace) {
                        this._instanceStore.setModpackFtbFiles(new Array());
                        this._instanceStore.setModules(new Array());
                    }
                    // save modpack files assets
                    if (modpackAssets.modpackType === "FTB") {
                        if (modpackAssets.files === undefined)
                            throw new Error("modpackAssets 'files' not null.");
                        this._instanceStore.setModpackFtbFiles(modpackAssets.files);
                    }
                    else {
                        this._instanceStore.setModpackFtbFiles(new Array());
                    }
                }
                // headers modules
                const modpackModules = modpackAssets !== null ? modpackAssets.modules : new Array();
                const moduleAssets = yield new ModuleHandler_1.default(this._serverInstanceDir, this._serverId, this._progressManager).getModuleAssetHandler(launcherAssetsParser.getModules(), { type: modpackAssets !== null ? modpackAssets.modpackType : "CurseForge", modules: modpackModules }, this._instanceStore.getModules());
                this._instanceStore.setModules(moduleAssets.modules);
                // headers modLoader
                const modLoaderId = modpackAssets !== null ? modpackAssets.modLoaderId : launcherAssetsParser.getModLoadersId();
                const modLoaderAssets = yield new ModLoader_1.default(this._serverId, launcherAssetsParser.getMinecraftVersion(), this._progressManager).getModLoaderAssets(modLoaderId);
                this._instanceStore.setModLoaderId(modLoaderId);
                this._instanceStore.setModLoaderType(modLoaderAssets.modLoaderType);
                this._instanceStore.setModLoaderVersion(modLoaderAssets.version);
                ProcessStop_1.ProcessStop.isThrowProcessStopped(this._serverId);
                this._progressManager.set(ProgressTypeEnum_1.ProgressTypeEnum.processModulesData, 5, 5);
                serverLauncherAssets = Object.assign(baseServerAssets, {
                    modpack: this._getModpackAssets(modpackAssets),
                    modLoader: modLoaderAssets,
                    module: moduleAssets
                });
                // test
                // console.log(this._instanceIo.getModpackFtbFiles());
                // console.log(this._instanceIo.getModules());
                this._instanceStore.setMinecraftVersion(launcherAssetsParser.getMinecraftVersion());
                this._logger.info("instanceStore save.");
                // save server instance.json
                this._instanceStore.save();
            }
            if (serverLauncherAssets === null)
                throw new Error("serverLauncherReturn not null.");
            // this._logger.info(`serverLauncherAssets: ${JSON.stringify(serverLauncherAssets)}`);
            return serverLauncherAssets;
        });
    }
    _getModpackAssets(modpackAssets) {
        if (modpackAssets === null) {
            return null;
        }
        if (modpackAssets.modpackType === "FTB") {
            return {
                type: "FTB",
                files: modpackAssets.files
            };
        }
        return {
            type: modpackAssets.modpackType
        };
    }
}
exports.default = LauncherObjsJsonHandler;
//# sourceMappingURL=LauncherObjJsonHandler.js.map