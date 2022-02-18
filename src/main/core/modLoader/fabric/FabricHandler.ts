import * as path from "path";
import * as fs from "fs-extra";

import GlobalPath from "../../io/GlobalPath";
import ProgressManager from "../../utils/ProgressManager";
import FabricAssetsApi from "../../../api/FabricAssetsApi";
import IFabricAssets from "../../../interfaces/IFabricAssets";
import IFabricObjsJSON from "../../../interfaces/IFabricObjsJSON";
import LoggerUtil from "../../utils/LoggerUtil";

export default class FabricHandler {

    private _logger: LoggerUtil = new LoggerUtil("FabricHandler");
    private _serverId: string;
    private _mojangVersion: string;
    private _fabricId: string;
    private _progressManager: ProgressManager;
    private _tempDirPath: string;
    private _commandDirPath: string;

    constructor(serverId: string, mojangVersion: string, fabricId: string, progressManager: ProgressManager) {
        this._serverId = serverId;
        this._mojangVersion = mojangVersion;
        this._fabricId = fabricId;
        this._progressManager = progressManager;
        this._tempDirPath = path.join(GlobalPath.getInstancesDirPath(), serverId, ".TEMP");
        this._commandDirPath = GlobalPath.getCommonDirPath();
    }

    public async fabricHandlerParser(): Promise<IFabricAssets> {

        // const tempModLoaderDirPath = path.join(this._tempDirPath, "FabricModLoader");
        const modLoaderVersionObjsJsonPath = path.join(this._commandDirPath, "versions", this._getFabricVersion(), `${this._getFabricVersion()}.json`);
        const fabricVersionObjJson = await this._getFabricVersionObjsJson(modLoaderVersionObjsJsonPath);
        return {
            versionJsonObject: fabricVersionObjJson,
            version: this._getFabricVersion(),
            arguments: fabricVersionObjJson.arguments,
            mainClass: fabricVersionObjJson.mainClass,
            libraries: this._parsingModLoadersLibraries(fabricVersionObjJson.libraries)
        };
    }

    private _getFabricVersion(): string {
        return `fabric-loader-${this._mojangVersion}-${this._fabricId.split("-")[1]}`;
    }

    private async _getFabricVersionObjsJson(modLoaderVersionObjsJsonPath: string): Promise<IFabricObjsJSON> {
        if(fs.existsSync(modLoaderVersionObjsJsonPath)) {

            this._logger.info(`讀取檔案 Path: ${modLoaderVersionObjsJsonPath}`);
            const versionObjsJsonData = fs.readJsonSync(modLoaderVersionObjsJsonPath);
            this._logger.info(`成功讀取檔案 Path: ${modLoaderVersionObjsJsonPath}`);

            return versionObjsJsonData;
        } else {

            const fabricVersionObjJson = await FabricAssetsApi.getFabricLoaderJson(this._mojangVersion, this._fabricId.split("-")[1]);
            if(fabricVersionObjJson === null) throw new Error("fabricVersionObjJson not null");

            this._logger.info(`寫入檔案 Path: ${modLoaderVersionObjsJsonPath}`);
            fs.ensureDirSync(path.join(modLoaderVersionObjsJsonPath, ".."));
            fs.writeFileSync(modLoaderVersionObjsJsonPath, JSON.stringify(fabricVersionObjJson), "utf8");
            this._logger.info(`成功寫入檔案 Path: ${modLoaderVersionObjsJsonPath}`);

            return fabricVersionObjJson;
        }
    }

    private _parsingModLoadersLibraries(libraries: Array<{ name: string; url: string }>): Array<{ name: string; download: { fileName: string, filePath: string, sha1: string, size: number, download: { url: string } } }> {

        const librariesDirPath = path.join(GlobalPath.getCommonDirPath(), "libraries");
        let librariesData = new Array <{ name: string; download: { fileName: string, filePath: string, sha1: string, size: number, download: { url: string } } }>();

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

    private _getLibFilePath(librariesDirPath: string, name: string): string {
        const nameSplit = name.split(":");
        const domains = nameSplit[0].split(".");
        return path.join(librariesDirPath, domains.join("/"), nameSplit[1], nameSplit[2], this._getLibFileName(name));
    }

    private _getLibDownloadUrl(url: string, name: string): string {
        const nameSplit = name.split(":");
        const domains = nameSplit[0].split(".");
        return `${url}${domains.join("/")}/${nameSplit[1]}/${nameSplit[2]}/${this._getLibFileName(name)}`;
    }

    private _getLibFileName(name: string): string {
        const nameSplit = name.split(":");
        return `${nameSplit[1]}-${nameSplit[2]}.jar`;
    }
}