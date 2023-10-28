"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = require("path");
const fs = require("fs-extra");
const GlobalPath_1 = require("../../io/GlobalPath");
const FabricAssetsApi_1 = require("../../../api/FabricAssetsApi");
const LoggerUtil_1 = require("../../utils/LoggerUtil");
class FabricHandler {
    constructor(serverId, mojangVersion, fabricId, progressManager) {
        this._logger = new LoggerUtil_1.default("FabricHandler");
        this._serverId = serverId;
        this._mojangVersion = mojangVersion;
        this._fabricId = fabricId;
        this._progressManager = progressManager;
        this._tempDirPath = path.join(GlobalPath_1.default.getInstancesDirPath(), serverId, ".TEMP");
        this._commandDirPath = GlobalPath_1.default.getCommonDirPath();
    }
    fabricHandlerParser() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // const tempModLoaderDirPath = path.join(this._tempDirPath, "FabricModLoader");
            const modLoaderVersionObjsJsonPath = path.join(this._commandDirPath, "versions", this._getFabricVersion(), `${this._getFabricVersion()}.json`);
            const fabricVersionObjJson = yield this._getFabricVersionObjsJson(modLoaderVersionObjsJsonPath);
            return {
                versionJsonObject: fabricVersionObjJson,
                version: this._getFabricVersion(),
                arguments: fabricVersionObjJson.arguments,
                mainClass: fabricVersionObjJson.mainClass,
                libraries: this._parsingModLoadersLibraries(fabricVersionObjJson.libraries)
            };
        });
    }
    _getFabricVersion() {
        return `fabric-loader-${this._mojangVersion}-${this._fabricId.split("-")[1]}`;
    }
    _getFabricVersionObjsJson(modLoaderVersionObjsJsonPath) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (fs.existsSync(modLoaderVersionObjsJsonPath)) {
                this._logger.info(`讀取檔案 Path: ${modLoaderVersionObjsJsonPath}`);
                const versionObjsJsonData = fs.readJsonSync(modLoaderVersionObjsJsonPath);
                this._logger.info(`成功讀取檔案 Path: ${modLoaderVersionObjsJsonPath}`);
                return versionObjsJsonData;
            }
            else {
                const fabricVersionObjJson = yield FabricAssetsApi_1.default.getFabricLoaderJson(this._mojangVersion, this._fabricId.split("-")[1]);
                if (fabricVersionObjJson === null)
                    throw new Error("fabricVersionObjJson not null");
                this._logger.info(`寫入檔案 Path: ${modLoaderVersionObjsJsonPath}`);
                fs.ensureDirSync(path.join(modLoaderVersionObjsJsonPath, ".."));
                fs.writeFileSync(modLoaderVersionObjsJsonPath, JSON.stringify(fabricVersionObjJson), "utf8");
                this._logger.info(`成功寫入檔案 Path: ${modLoaderVersionObjsJsonPath}`);
                return fabricVersionObjJson;
            }
        });
    }
    _parsingModLoadersLibraries(libraries) {
        const librariesDirPath = path.join(GlobalPath_1.default.getCommonDirPath(), "libraries");
        let librariesData = new Array();
        for (let lib of libraries) {
            librariesData.push({
                name: lib.name,
                download: {
                    fileName: this._getLibFileName(lib.name),
                    filePath: this._getLibFilePath(librariesDirPath, lib.name),
                    sha1: "",
                    size: 0,
                    download: {
                        url: this._getLibDownloadUrl(lib.url, lib.name)
                    }
                }
            });
        }
        return librariesData;
    }
    _getLibFilePath(librariesDirPath, name) {
        const nameSplit = name.split(":");
        const domains = nameSplit[0].split(".");
        return path.join(librariesDirPath, domains.join("/"), nameSplit[1], nameSplit[2], this._getLibFileName(name));
    }
    _getLibDownloadUrl(url, name) {
        const nameSplit = name.split(":");
        const domains = nameSplit[0].split(".");
        return `${url}${domains.join("/")}/${nameSplit[1]}/${nameSplit[2]}/${this._getLibFileName(name)}`;
    }
    _getLibFileName(name) {
        const nameSplit = name.split(":");
        return `${nameSplit[1]}-${nameSplit[2]}.jar`;
    }
}
exports.default = FabricHandler;
//# sourceMappingURL=FabricHandler.js.map