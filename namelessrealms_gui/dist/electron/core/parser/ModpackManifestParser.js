"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ModpackManifestParser {
    constructor(manifestJson) {
        this._manifestJson = manifestJson;
    }
    getModules() {
        return this._manifestJson.files;
    }
    getName() {
        return this._manifestJson.name;
    }
    getModLoaderId() {
        return this._manifestJson.minecraft.modLoaders[0].id;
    }
}
exports.default = ModpackManifestParser;
//# sourceMappingURL=ModpackManifestParser.js.map