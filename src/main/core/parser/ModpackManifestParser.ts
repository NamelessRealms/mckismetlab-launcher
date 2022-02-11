export default class ModpackManifestParser {
    private _manifestJson;

    constructor(manifestJson: any) {
        this._manifestJson = manifestJson;
    }

    public get modules(): Array<{ projectID: number, fileID: number, required: boolean }> {
        return this._manifestJson.files;
    }

    public get name(): string {
        return this._manifestJson.name
    }
}