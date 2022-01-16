import got from "got";

export default class MojangAssetsService {

    private static versionManifestUrl: string = "https://launchermeta.mojang.com/mc/game/version_manifest.json";

    public static getVersionManifest(): Promise<IVersionManifest> {
        return new Promise(async (resolve, reject) => {
            try {

                const response = await got.get(this.versionManifestUrl);

                if(response.statusCode !== 200) {
                    return reject(response.body);
                }

                return resolve(JSON.parse(response.body));

            } catch (error: any) {
                return reject(error);
            }
        });
    }

}

interface IVersionManifest {
    latest: {
        release: string;
        snapshot: string;
    },
    versions: Array<{
        id: string;
        type: string;
        url: string;
        time: string;
        releaseTime: string;
    }>
}