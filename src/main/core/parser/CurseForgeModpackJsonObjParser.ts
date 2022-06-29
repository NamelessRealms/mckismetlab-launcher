export default class CurseForgeModpackJsonObjParser {

    private _curseForgeModpackJsonObj;

    constructor(curseForgeModpackJsonObj: any) {
        this._curseForgeModpackJsonObj = curseForgeModpackJsonObj;
    }

    public get downloadUrl(): string | null {
        return this._curseForgeModpackJsonObj.downloadUrl;
    }

    public get id(): number {
        return this._curseForgeModpackJsonObj.id;
    }

    public get fileName(): string {
        return this._curseForgeModpackJsonObj.fileName;
    }
}