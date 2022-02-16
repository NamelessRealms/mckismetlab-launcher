export default class ModpackManifestParser {
    private _manifestJson;

    constructor(manifestJson: any) {
        this._manifestJson = manifestJson;
    }

    public getModules(): Array<{ projectID: number, fileID: number, required: boolean }> {
        return this._manifestJson.files;
    }

    public getName(): string {
        return this._manifestJson.name
    }

    public getModLoaderId(): string {
        return this._manifestJson.minecraft.modLoaders[0].id;
    }
}