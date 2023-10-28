"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("../utils/Utils");
class ForgeVersionJsonParser {
    constructor(forgeVersionJsonData, minecraftVersion) {
        this._minecraftVersion = minecraftVersion;
        this._forgeVersionJsonData = forgeVersionJsonData;
    }
    get libraries() {
        return this._forgeVersionJsonData.libraries;
    }
    get mainClass() {
        return this._forgeVersionJsonData.mainClass;
    }
    get minecraftArguments() {
        if (Utils_1.default.isMcVersion("1.13", this._minecraftVersion)) {
            return this._forgeVersionJsonData.arguments;
        }
        else {
            return this._forgeVersionJsonData.minecraftArguments;
        }
    }
}
exports.default = ForgeVersionJsonParser;
//# sourceMappingURL=ForgeVersionJsonParser.js.map