import * as path from "path";
import * as fs from "fs-extra";
import got from "got";

import GlobalPath from "../io/GlobalPath";
import Utils from "../utils/Utils";
import Downloader from "../utils/Downloader";
import ModpackManifestParser from "../parser/ModpackManifestParser";
import CurseForgeModpackJsonObjParser from "../parser/CurseForgeModpackJsonObjParser";
import IModule from "../../interfaces/IModule";
import ModuleHandler from "./ModuleHandler";
import InstanceIo from "../io/InstanceIo";
import ProgressManager from "../utils/ProgressManager";
import { ProgressTypeEnum } from "../../enums/ProgressTypeEnum";
import { ProcessStop, Stop } from "../utils/ProcessStop";

export default class ModpackHandler {

    private _commandDirPath: string;
    private _serverInstanceDir: string;
    private _serverId: string;
    private _modpackInstance: {
        type: "Revise" | "CurseForge" | "FTB";
        name: string;
        version: string;
        projectId: number;
        fileId: number;
        downloadUrl: string
    }
    private _instanceIo: InstanceIo;
    private _progressManager: ProgressManager;

    constructor(serverId: string, instanceIo: InstanceIo, modpackInstance: {
        type: "Revise" | "CurseForge" | "FTB";
        name: string;
        version: string;
        projectId: number;
        fileId: number;
        downloadUrl: string
    }, progressManager: ProgressManager) {
        this._serverId = serverId;
        this._commandDirPath = GlobalPath.getCommonDirPath();
        this._serverInstanceDir = path.join(GlobalPath.getInstancesDirPath(), serverId);
        this._instanceIo = instanceIo;
        this._modpackInstance = modpackInstance;
        this._progressManager = progressManager;
    }

    public async modpackHandler(): Promise<{
        modpack: {
            name: string;
            version: string;
            projectId: number;
            fileId: number;
        },
        modules: Array<IModule>
    }> {

        const tempModpackDirPath = path.join(this._commandDirPath, "temp", this._serverId, "modpack");

        // 檢查是否要更換模組包
        if (this._isModpackReplace(this._modpackInstance.type, this._modpackInstance.name, this._modpackInstance.version, this._modpackInstance.projectId)) {

            let apiModpack = {
                fileName: "",
                downloadUrl: ""
            }

            // 檢查模組包的類型
            switch (this._modpackInstance.type) {
                case "CurseForge":
                    apiModpack = await this._modpackCurseForge(this._modpackInstance.projectId, this._modpackInstance.fileId, this._modpackInstance.name);
                    break;
                case "Revise":
                    apiModpack = await this._modpackRevise(this._modpackInstance.name, this._modpackInstance.downloadUrl);
                    break;
            }

            const tempModpackFilePath = path.join(tempModpackDirPath, apiModpack.fileName);
            const tempModpackOverridesDirPath = path.join(tempModpackDirPath, "overrides");
            const tempModpackManifestJsonPath = path.join(tempModpackDirPath, "manifest.json");
            const serverInstanceMinecraftDirPath = path.join(this._serverInstanceDir, ".minecraft");

            // download modpack file
            await Downloader.download(apiModpack.downloadUrl, tempModpackFilePath, (percent) => this._progressManager.set(ProgressTypeEnum.downloadParseModpackData, percent));

            // unFile modpack file
            await Utils.unZipFile(tempModpackFilePath, path.join(tempModpackFilePath, ".."));

            // copy modpack overrides dir
            fs.emptyDirSync(serverInstanceMinecraftDirPath);
            fs.copySync(tempModpackOverridesDirPath, serverInstanceMinecraftDirPath);

            // stop
            ProcessStop.isThrowProcessStopped(this._serverId);

            const manifestJsonObject = fs.readJSONSync(tempModpackManifestJsonPath);
            const modpackManifestParser = new ModpackManifestParser(manifestJsonObject);
            const modules = await new ModuleHandler(this._serverInstanceDir, this._serverId).modulesInfo(modpackManifestParser.modules, this._progressManager);

            fs.removeSync(tempModpackDirPath);

            return {
                modpack: {
                    name: modpackManifestParser.name,
                    version: this._modpackInstance.version,
                    projectId: this._modpackInstance.projectId,
                    fileId: this._modpackInstance.fileId
                },
                modules: modules
            };

        } else {
            return {
                modpack: {
                    name: this._instanceIo.getModpackName(),
                    version: this._modpackInstance.version,
                    projectId: this._modpackInstance.projectId,
                    fileId: this._modpackInstance.fileId
                },
                modules: this._instanceIo.getModules()
            }
        }
    }

    private _modpackRevise(name: string, downloadUrl: string): Promise<{
        fileName: string;
        downloadUrl: string;
    }> {
        return new Promise((resolve) => {

            const modpackFileName = `${name}.zip`;

            return resolve({
                fileName: modpackFileName,
                downloadUrl: downloadUrl
            })
        });
    }

    private async _modpackCurseForge(projectId: number, fileId: number, name: string): Promise<{
        fileName: string;
        downloadUrl: string;
    }> {

        const modpackDownloadUrl = `https://addons-ecs.forgesvc.net/api/v2/addon/${projectId}/file/${fileId}`;
        const response = await got.get(modpackDownloadUrl);

        if (response.statusCode !== 200 || response.body === undefined) throw new Error("Get modpack failure.");

        const curseForgeModpackJsonObjParser = new CurseForgeModpackJsonObjParser(JSON.parse(response.body));
        const modpackFileName = Utils.urlLastName(curseForgeModpackJsonObjParser.downloadUrl);

        if (modpackFileName === undefined) {
            throw new Error("modpackFileName not null.");
        }

        return {
            fileName: modpackFileName,
            downloadUrl: curseForgeModpackJsonObjParser.downloadUrl
        };
    }

    // TODO: FTB modpack
    private _isModpackReplace(modpackType: "Revise" | "CurseForge" | "FTB", modpackName: string, modpackVersion: string, modpackProjectId: number): boolean {
        switch (modpackType) {
            case "CurseForge":
                return this._instanceIo.getModpackProjectId() === modpackProjectId ? false : true || Utils.isVersion(this._instanceIo.getModpackVersion(), modpackVersion);
            case "Revise":
                return this._instanceIo.getModpackName() !== modpackName || Utils.isVersion(this._instanceIo.getModpackVersion(), modpackVersion);
            default:
                return true;
        }
    }
}