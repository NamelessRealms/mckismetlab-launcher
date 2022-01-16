import Utils from "../utils/Utils";
import IMojangLib from "../../interfaces/IMojangLib";
import IParsingArgumentReturn from "../../interfaces/IParsingArgumentReturn";

export default class MojangManifestParser {

    private _jsonObject;

    constructor(jsonObject: any) {
        this._jsonObject = jsonObject;
    }

    public get assetIndexUrl(): string {
        return this._jsonObject.assetIndex.url;
    }

    public get mojangClient(): { sha1: string, size: number, url: string } {
        return this._jsonObject.downloads.client;
    }

    public get libraries(): Array<IMojangLib> {
        return this._jsonObject.libraries;
    }

    public get mainClass(): string {
        return this._jsonObject.mainClass;
    }

    public get arguments(): IParsingArgumentReturn {
        if (Utils.isMcVersion("1.13", this._jsonObject.id)) {
            return {
                game: this._jsonObject.arguments.game,
                jvm: this._jsonObject.arguments.jvm
            }
        } else {
            return {
                game: this._jsonObject.minecraftArguments,
                jvm: undefined
            }
        }
    }

    public get assetsVersion(): string {
        return this._jsonObject.assets;
    }

    public get gameVersion(): string {
        return this._jsonObject.id;
    }

    public get type(): string {
        return this._jsonObject.type;
    }
}