import got from "got";
import IFabricObjsJSON from "../interfaces/IFabricObjsJSON";

export default class FabricAssetsApi {

    private static _fabricJSONUrl = "https://meta.fabricmc.net/v2/versions/loader";

    public static async getFabricLoaderJson(mojangVersion: string, modLoaderVersion: string): Promise<IFabricObjsJSON | null> {

        const resources = await got.get<IFabricObjsJSON>(`${this._fabricJSONUrl}/${mojangVersion}/${modLoaderVersion}/profile/json`, {
            responseType: "json"
        });

        if(resources.statusCode !== 200) {
            return null;
        }

        return resources.body;
    }

}