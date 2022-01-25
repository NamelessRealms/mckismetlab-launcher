export default class CurseForgeModpackJsonObjParser {

    private _curseForgeModpackJsonObj;

    constructor(curseForgeModpackJsonObj: any) {
        this._curseForgeModpackJsonObj = curseForgeModpackJsonObj;
    }

    public get downloadUrl(): string {
        return this._curseForgeModpackJsonObj.downloadUrl;
    }
}