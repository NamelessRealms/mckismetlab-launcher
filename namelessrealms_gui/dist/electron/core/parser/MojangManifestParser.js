"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("../utils/Utils");
class MojangManifestParser {
    constructor(jsonObject) {
        this._jsonObject = jsonObject;
    }
    get assetIndexUrl() {
        return this._jsonObject.assetIndex.url;
    }
    get mojangClient() {
        return this._jsonObject.downloads.client;
    }
    get libraries() {
        return this._jsonObject.libraries;
    }
    get mainClass() {
        return this._jsonObject.mainClass;
    }
    get arguments() {
        if (Utils_1.default.isMcVersion("1.13", this._jsonObject.id)) {
            return {
                game: this._jsonObject.arguments.game,
                jvm: this._jsonObject.arguments.jvm
            };
        }
        else {
            return {
                game: this._jsonObject.minecraftArguments,
                jvm: undefined
            };
        }
    }
    get assetsVersion() {
        return this._jsonObject.assets;
    }
    get gameVersion() {
        return this._jsonObject.id;
    }
    get type() {
        return this._jsonObject.type;
    }
}
exports.default = MojangManifestParser;
//# sourceMappingURL=MojangManifestParser.js.map