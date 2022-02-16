import Utils from "../utils/Utils";
import IForgeVersionLibraries from "../../interfaces/IForgeVersionLibraries";

export default class ForgeVersionJsonParser {
    
    private _minecraftVersion;
    private _forgeVersionJsonData;

    constructor(forgeVersionJsonData: any, minecraftVersion: string) {
        this._minecraftVersion = minecraftVersion;
        this._forgeVersionJsonData = forgeVersionJsonData;
    }

    public get libraries(): Array<IForgeVersionLibraries> {
        return this._forgeVersionJsonData.libraries;
    }

    public get mainClass(): string {
        return this._forgeVersionJsonData.mainClass;
    }

    public get minecraftArguments(): { game: Array<string>, jvm: Array<string> } | string {
        if (Utils.isMcVersion("1.13", this._minecraftVersion)) {
            return this._forgeVersionJsonData.arguments;
        } else {
            return this._forgeVersionJsonData.minecraftArguments;
        }
    }
}