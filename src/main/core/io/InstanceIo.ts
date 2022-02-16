import * as path from "path";
import * as fs from "fs-extra";

import IInstanceIo from "../../interfaces/IInstanceIo";
import IModule from "../../interfaces/IModule";
import GlobalPath from "./GlobalPath";
export default class InstanceIo {

    private _serverInstanceFilePath;

    private _serverInstance: IInstanceIo;

    constructor(serverId: string) {
        this._serverInstanceFilePath = path.join(GlobalPath.getInstancesDirPath(), serverId, "instance.json");

        // if (!fs.existsSync(this._serverInstanceFilePath)) {
        //     this._serverInstance.instanceId = this._serverId;
        //     fs.ensureDirSync(path.join(this._serverInstanceFilePath, ".."));
        //     fs.writeFileSync(this._serverInstanceFilePath, JSON.stringify(this._serverInstance, null, 2), "utf-8");
        // }

        if (!fs.existsSync(this._serverInstanceFilePath)) {
            fs.ensureDirSync(path.join(this._serverInstanceFilePath, ".."));
            fs.writeFileSync(this._serverInstanceFilePath, JSON.stringify({
                instanceId: serverId,
                minecraftVersion: "",
                modpack: {
                    name: "",
                    version: "",
                    projectId: "",
                    fileId: "",
                    ftb: {
                        files: new Array<{ fileName: string, filePath: string, sha1: string, size: number, download: { url: string } }>()
                    }
                },
                modLoader: {
                    type: "",
                    id: "",
                    version: ""
                },
                module: {
                    size: 0,
                    modules: new Array<IModule>()
                }
            }, null, 2), "utf-8");
        }

        this._serverInstance = fs.readJSONSync(this._serverInstanceFilePath);
    }

    public save(): void {
        fs.writeFileSync(this._serverInstanceFilePath, JSON.stringify(this._serverInstance, null, 2), "utf-8");
    }

    public getModpackVersion(): string {
        return this._serverInstance.modpack.version;
    }

    public setModpackVersion(version: string) {
        this._serverInstance.modpack.version = version;
    }

    public getModpackName(): string {
        return this._serverInstance.modpack.name;
    }

    public setModpackName(name: string) {
        this._serverInstance.modpack.name = name;
    }

    public getModules(): Array<IModule> {
        return this._serverInstance.module.modules;
    }

    public setModules(modules: Array<IModule>) {
        this._serverInstance.module.size = modules.length;
        this._serverInstance.module.modules = modules;
    }

    public getModpackProjectId(): number {
        return this._serverInstance.modpack.projectId;
    }

    public setModpackProjectId(projectId: number) {
        this._serverInstance.modpack.projectId = projectId;
    }

    public setModpackFileId(fileId: number) {
        this._serverInstance.modpack.fileId = fileId;
    }

    public setModLoaderType(loadersType: "Forge" | "Fabric") {
        this._serverInstance.modLoader.type = loadersType;
    }

    public setModLoaderVersion(loadersVersion: string) {
        this._serverInstance.modLoader.version = loadersVersion;
    }

    public setModLoaderId(id: string) {
        this._serverInstance.modLoader.id = id;
    }

    public getModLoaderId(): string {
        return this._serverInstance.modLoader.id;
    }

    public setMinecraftVersion(minecraftVersion: string) {
        this._serverInstance.minecraftVersion = minecraftVersion;
    }

    public setModpackFtbFiles(files: Array<{ fileName: string, filePath: string, sha1: string, size: number, download: { url: string } }>) {
        this._serverInstance.modpack.ftb.files = files;
    }

    public getModpackFtbFiles(): Array<{ fileName: string, filePath: string, sha1: string, size: number, download: { url: string } }> {
        return this._serverInstance.modpack.ftb.files;
    }
}