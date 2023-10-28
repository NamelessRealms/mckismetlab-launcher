"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LauncherAssetsJsonParser = void 0;
const Utils_1 = require("../utils/Utils");
class LauncherAssetsJsonParser {
    constructor(serverId, launcherAssetsObjectsJson) {
        this._launcherAssetsJsonObjects = launcherAssetsObjectsJson;
        const serverAssetsObjectsJson = launcherAssetsObjectsJson.servers.find(server => server.id === serverId);
        if (serverAssetsObjectsJson === undefined)
            throw new Error("serverAssetsObjectsJson not null.");
        this._serverAssetsJsonObjects = serverAssetsObjectsJson;
    }
    getServers() {
        return this._launcherAssetsJsonObjects.servers;
    }
    getJavaVMVersion() {
        return this._serverAssetsJsonObjects.java[Utils_1.default.getOSType()].version;
    }
    getJavaVMFileName() {
        return this._serverAssetsJsonObjects.java[Utils_1.default.getOSType()].download.fileName;
    }
    getJavaVMDownloadUrl() {
        return this._serverAssetsJsonObjects.java[Utils_1.default.getOSType()].download.url;
    }
    getId() {
        return this._serverAssetsJsonObjects.id;
    }
    getMinecraftVersion() {
        return this._serverAssetsJsonObjects.minecraftVersion;
    }
    getMinecraftType() {
        return this._serverAssetsJsonObjects.minecraftType;
    }
    getModpackData() {
        if (this._serverAssetsJsonObjects.modpack !== null) {
            return this._serverAssetsJsonObjects.modpack;
        }
        else {
            throw new Error("serverAssetsObjectsJson 'modpack' not null.");
        }
    }
    getModpackType() {
        return this.getModpackData().type;
    }
    getModpackName() {
        return this.getModpackData().name;
    }
    getModpackProjectId() {
        return this.getModpackData().projectId;
    }
    getModpackFileId() {
        return this.getModpackData().fileId;
    }
    getModpackVersion() {
        return this.getModpackData().version;
    }
    getModpackDownloadUrl() {
        return this.getModpackData().downloadUrl;
    }
    getModLoaderData() {
        if (this._serverAssetsJsonObjects.modLoader !== null) {
            return this._serverAssetsJsonObjects.modLoader;
        }
        else {
            throw new Error("serverAssetsObjectsJson 'modLoader' not null.");
        }
    }
    getModLoadersType() {
        return this.getModLoaderData().type;
    }
    getModLoadersId() {
        return this.getModLoaderData().id;
    }
    getModLoadersVersion() {
        return this.getModLoaderData().version;
    }
    getModLoadersUrl() {
        return this.getModLoaderData().download.url;
    }
    getModules() {
        return this._serverAssetsJsonObjects.modules;
    }
}
exports.LauncherAssetsJsonParser = LauncherAssetsJsonParser;
//# sourceMappingURL=LauncherAssetsJsonParser.js.map