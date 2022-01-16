export default class ForgeInstallProfileParser {

    private _forgeInstallProfileJsonObjs;

    constructor(forgeInstallProfileJsonObjs: any) {
        this._forgeInstallProfileJsonObjs = forgeInstallProfileJsonObjs;
    }

    public get librariesSavePath(): string {
        return this._forgeInstallProfileJsonObjs.path.replace(".", "\\").replace(new RegExp(":", "g"), "\\");
    }

    public get data(): any {
        return this._forgeInstallProfileJsonObjs.data;
    }

    public get libraries(): Array<{ name: string, downloads: { artifact: { path: string, url: string, sha1: string, size: number } } }> {
        return this._forgeInstallProfileJsonObjs.libraries;
    }

    public get processors(): any {
        return this._forgeInstallProfileJsonObjs.processors;
    }
}