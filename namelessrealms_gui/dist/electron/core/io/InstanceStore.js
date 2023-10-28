"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs-extra");
const GlobalPath_1 = require("./GlobalPath");
const LoggerUtil_1 = require("../utils/LoggerUtil");
class InstanceStore {
    constructor(serverId) {
        this._logger = new LoggerUtil_1.default("InstanceStore");
        this._serverId = serverId;
        this._serverInstanceFilePath = path.join(GlobalPath_1.default.getInstancesDirPath(), serverId, "instance.json");
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
                    files: new Array()
                },
                modLoader: {
                    type: "",
                    id: "",
                    version: ""
                },
                module: {
                    size: 0,
                    modules: new Array()
                }
            }, null, 2), "utf-8");
        }
        this._logger.info(`server id: ${serverId}`);
        this._logger.info(`讀取JSON資料 file path: ${this._serverInstanceFilePath}`);
        this._serverInstance = fs.readJSONSync(this._serverInstanceFilePath);
    }
    save() {
        this._logger.info(`server id: ${this._serverId}`);
        this._logger.info(`儲存JSON資料 file path: ${this._serverInstanceFilePath}`);
        fs.writeFileSync(this._serverInstanceFilePath, JSON.stringify(this._serverInstance, null, 2), "utf-8");
    }
    getModpackVersion() {
        return this._serverInstance.modpack.version;
    }
    setModpackVersion(version) {
        this._serverInstance.modpack.version = version;
    }
    getModpackName() {
        return this._serverInstance.modpack.name;
    }
    setModpackName(name) {
        this._serverInstance.modpack.name = name;
    }
    getModules() {
        return this._serverInstance.module.modules;
    }
    setModules(modules) {
        this._serverInstance.module.size = modules.length;
        this._serverInstance.module.modules = modules;
    }
    getModpackProjectId() {
        return this._serverInstance.modpack.projectId;
    }
    setModpackProjectId(projectId) {
        this._serverInstance.modpack.projectId = projectId;
    }
    setModpackFileId(fileId) {
        this._serverInstance.modpack.fileId = fileId;
    }
    setModLoaderType(loadersType) {
        this._serverInstance.modLoader.type = loadersType;
    }
    setModLoaderVersion(loadersVersion) {
        this._serverInstance.modLoader.version = loadersVersion;
    }
    setModLoaderId(id) {
        this._serverInstance.modLoader.id = id;
    }
    getModLoaderId() {
        return this._serverInstance.modLoader.id;
    }
    setMinecraftVersion(minecraftVersion) {
        this._serverInstance.minecraftVersion = minecraftVersion;
    }
    setModpackFtbFiles(files) {
        this._serverInstance.modpack.files = files;
    }
    getModpackFtbFiles() {
        return this._serverInstance.modpack.files;
    }
}
exports.default = InstanceStore;
//# sourceMappingURL=InstanceStore.js.map