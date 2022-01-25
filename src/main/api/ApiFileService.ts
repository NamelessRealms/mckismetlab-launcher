import got from "got";
import { LauncherAssetsJsonParser } from "../core/parser/LauncherAssetsJsonParser";

import Config from "../config/Configs";

export default class ApiFileService {

    private static _launcherAssetData = {
        "data_id": 1,
        "data": {
            "date": "2021/3/13 下午8:59:41",
            "version": "1.0.0",
            "serverList": {
                "mckismetlab-main-server": {
                    "id": "mckismetlab-main-server",
                    "java": {
                        "windows": {
                            "version": "1.8.0_311",
                            "download": {
                                "url": "https://www.dropbox.com/s/u05tmnzxyc00v8y/jre1.8.0_311.zip?dl=1",
                                "fileName": "jre1.8.0_311.zip"
                            }
                        },
                        "osx": {
                            "version": "1.8.0_311",
                            "download": {
                                "url": "https://www.dropbox.com/s/5iym61rd8kz70yb/jre1.8.0_311.jre.zip?dl=1",
                                "fileName": "jre1.8.0_311.zip"
                            }
                        }
                    },
                    "modpack": {
                        "url": "",
                        "name": "Create: Above and Beyond",
                        "type": "CurseForge",
                        "fileId": 3541082,
                        "version": "1.2",
                        "projectId": 542763
                    },
                    "modules": [
                        {
                            "name": "FTB Essentials",
                            "type": "CurseForge",
                            "action": "ADD",
                            "fileId": 3510643,
                            "version": "1605.1.5-build.32",
                            "projectId": 410811,
                            "downloadUrl": ""
                        }
                    ],
                    "modLoaders": {
                        "id": "forge-1.16.5-36.2.8",
                        "type": "forge",
                        "version": "1.16.5-36.2.8",
                        "download": {
                            "url": "https://maven.minecraftforge.net/net/minecraftforge/forge/1.16.5-36.2.8/forge-1.16.5-36.2.8-installer.jar"
                        }
                    },
                    "minecraftType": "minecraftModpack",
                    "minecraftVersion": "1.16.5"
                },
                "mckismetlab-test-server": {
                    "id": "mckismetlab-test-server",
                    "java": {
                        "windows": {
                            "version": "1.8.0_311",
                            "download": {
                                "url": "https://www.dropbox.com/s/u05tmnzxyc00v8y/jre1.8.0_311.zip?dl=1",
                                "fileName": "jre1.8.0_311.zip"
                            }
                        },
                        "osx": {
                            "version": "17.0.1",
                            "download": {
                                "url": "https://www.dropbox.com/s/b61ba8qklv78t7d/jdk-17.0.1.jdk.zip?dl=1",
                                "fileName": "jdk-17.0.1.zip"
                            }
                        }
                    },
                    "modpack": undefined,
                    "modules": [],
                    "modLoaders": undefined,
                    "minecraftType": "minecraftVanilla",
                    "minecraftVersion": "1.18.1"
                }
            }
        },
        "date": "2022-01-16T05:33:47.000Z"
    }

    private static _launcherAssetsUrl = Config.launcherAssetsUrl;

    public static async getLauncherAssetsParser(serverId: string): Promise<LauncherAssetsJsonParser> {
        const requestLauncherAssetsJson = await this.requestLauncherAssetsJson();
        return new LauncherAssetsJsonParser(serverId, requestLauncherAssetsJson);
    }

    private static requestLauncherAssetsJson(): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {

                // const launcherAssetsResponse = await got.get<any>(this._launcherAssetsUrl);

                // if (launcherAssetsResponse.body === undefined) {
                //     return reject({ error: "UndefinedLauncherAssets", errorMessage: "Undefined launcher assets response!" });
                // }

                // return resolve(JSON.parse(launcherAssetsResponse.body).data);

                return resolve(this._launcherAssetData.data);

            } catch (error: any) {
                if (error.response.status === 404) {
                    return reject({ error: "UnableConnectApiServer", errorMessage: "Unable to connect to api server" });
                }
            }
        });
    }
}