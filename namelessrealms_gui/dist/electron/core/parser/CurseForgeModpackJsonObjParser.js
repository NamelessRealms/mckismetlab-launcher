"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CurseForgeModpackJsonObjParser {
    constructor(curseForgeModpackJsonObj) {
        this._curseForgeModpackJsonObj = curseForgeModpackJsonObj;
    }
    get downloadUrl() {
        return this._curseForgeModpackJsonObj.downloadUrl;
    }
    get id() {
        return this._curseForgeModpackJsonObj.id;
    }
    get fileName() {
        return this._curseForgeModpackJsonObj.fileName;
    }
}
exports.default = CurseForgeModpackJsonObjParser;
//# sourceMappingURL=CurseForgeModpackJsonObjParser.js.map