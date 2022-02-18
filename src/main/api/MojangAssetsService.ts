import LoggerUtil from "../core/utils/LoggerUtil";
import got from "got";

export default class MojangAssetsService {

    private static _logger: LoggerUtil = new LoggerUtil("MojangAssetsService");

    private static versionManifestUrl: string = "https://launchermeta.mojang.com/mc/game/version_manifest.json";

    public static getVersionManifest(): Promise<IVersionManifest> {
        return new Promise(async (resolve, reject) => {
            try {

                this._logger.info(`請求 GET ${this.versionManifestUrl}`);

                const response = await got.get(this.versionManifestUrl);

                if(response.statusCode !== 200) {
                    this._logger.error(`請求失敗 GET ${this.versionManifestUrl}`);
                    return reject(response.body);
                }

                this._logger.info(`成功請求 GET ${this.versionManifestUrl}`);

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