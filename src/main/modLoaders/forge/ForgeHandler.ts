import * as path from "path";
import * as fs from "fs-extra";

import GlobalPath from "../../io/GlobalPath";
import Utils from "../../utils/Utils";
import Downloader from "../../utils/Downloader";
import ForgeInstallProfileParser from "../../parser/ForgeInstallProfileParser";
import { IModLoaders } from "../../../interfaces/IModLoaders";

export default class ForgeHandler {

    private _commandDirPath: string;
    private _tempDirPath: string;
    private _mojangVersion: string;
    private _forgeVersion: string;
    private _forgeDownloadUrl: string;

    constructor(serverId: string, mojangVersion: string, forgeInstance: { version: string; downloadUrl: string }) {
        this._commandDirPath = GlobalPath.getCommonDirPath();
        this._tempDirPath = path.join(this._commandDirPath, "temp", serverId);
        this._mojangVersion = mojangVersion;
        this._forgeVersion = forgeInstance.version;
        this._forgeDownloadUrl = forgeInstance.downloadUrl;
    }
    public forgeHandlerParser(): Promise<{
        isInstall: boolean;
        modLoadersType: "forge",
        forgeVersion: string;
        versionJsonObject: any,
        installProfile?: {
            data: {
                "": {
                    client: string,
                    server: string
                },
                [name: string]: {
                    client: string;
                    server: string;
                };
            };
            libraries: Array<{
                name: string;
                downloads: {
                    artifact: {
                        path: string;
                        url: string;
                        sha1: string;
                        size: number;
                    };
                };
            }>;
            processors: Array<any>;
            clientLzmaPath: string;
        }
    }> {
        return new Promise(async (resolve) => {

            const tempForgeDirPath = path.join(this._tempDirPath, "ForgeModLoader");
            const forgeVersionJsonObjectPath = path.join(this._commandDirPath, "versions", this._forgeVersion, `${this._forgeVersion}.json`);

            if (this._validateForgeJar(this._forgeVersion)) {

                const forgeInstallProfile = await this._doForgeParser(tempForgeDirPath, forgeVersionJsonObjectPath, this._forgeDownloadUrl);
                const forgeVersionJsonObject = fs.readJSONSync(forgeVersionJsonObjectPath);

                fs.removeSync(tempForgeDirPath);

                return resolve({
                    isInstall: true,
                    modLoadersType: "forge",
                    forgeVersion: this._forgeVersion,
                    versionJsonObject: forgeVersionJsonObject,
                    installProfile: forgeInstallProfile
                });
            } else {
                const forgeVersionJsonObject = fs.readJSONSync(forgeVersionJsonObjectPath);
                return resolve({
                    isInstall: false,
                    modLoadersType: "forge",
                    forgeVersion: this._forgeVersion,
                    versionJsonObject: forgeVersionJsonObject
                });
            }
        });
    }

    private _doForgeParser(tempForgeDirPath: string, forgeVersionJsonObjectPath: string, forgeDownloadUrl: string): Promise<{
        data: any;
        libraries: Array<{
            name: string;
            downloads: {
                artifact: {
                    path: string;
                    url: string;
                    sha1: string;
                    size: number;
                };
            };
        }>;
        processors: any;
        clientLzmaPath: string;
    } | undefined> {
        return new Promise(async (resolve) => {

            const gameLibrariesDirPath = path.join(this._commandDirPath, "libraries");
            const tempForgeFileNamePath = path.join(tempForgeDirPath, Utils.urlLastName(forgeDownloadUrl) as string);
            const tempForgeInstallProfileJsonPath = path.join(tempForgeDirPath, "install_profile.json");
            const tempForgeMavenDirPath = path.join(tempForgeDirPath, "maven");
            const tempForgeVersionJsonPath = path.join(tempForgeDirPath, "version.json");

            // download modLoaders file
            await Downloader.download(forgeDownloadUrl, tempForgeFileNamePath);

            // unFile modLoaders file
            await Utils.unZipFile(tempForgeFileNamePath, tempForgeDirPath);

            const forgeInstallProfileJsonObject = fs.readJSONSync(tempForgeInstallProfileJsonPath);
            const forgeInstallProfileParser = new ForgeInstallProfileParser(forgeInstallProfileJsonObject);

            // copy modLoaders jar file
            this._copyForgeMavenJarDir(tempForgeMavenDirPath, gameLibrariesDirPath);

            // copy version jar file
            this._copyForgeVersionJsonFile(tempForgeVersionJsonPath, forgeVersionJsonObjectPath);

            // handler client.lzma
            if (Utils.isMcVersion("1.13", this._mojangVersion)) {
                const tempClientLzmaFilePath = path.join(tempForgeDirPath, "data", "client.lzma");
                return resolve({
                    data: forgeInstallProfileParser.data,
                    libraries: forgeInstallProfileParser.libraries,
                    processors: forgeInstallProfileParser.processors,
                    clientLzmaPath: tempClientLzmaFilePath
                });
            }

            return resolve(undefined);
        });
    }

    private _copyForgeVersionJsonFile(filePath: string, targetFilePath: string): void {
        fs.emptyDirSync(path.join(targetFilePath, ".."));
        fs.copySync(filePath, targetFilePath);
    }

    private _copyForgeMavenJarDir(dirPath: string, targetDirPath: string): void {
        fs.ensureDirSync(targetDirPath);
        fs.copySync(dirPath, targetDirPath);
    }

    private _validateForgeJar(forgeVersion: string): boolean {

        const gameLibrariesDirPath = path.join(this._commandDirPath, "libraries");
        // ["1.16.5", "36.2.8"]
        const forgeVersionSplit = forgeVersion.split("-");
        // const mojangVersion = forgeVersionSplit[0];
        const mojangVersion = this._mojangVersion;
        const forgeMinorVersion = forgeVersionSplit[1];

        const necessaryFiles = new Array<string>();

        if (Utils.isMcVersion("1.13", mojangVersion)) {
            necessaryFiles.push(`net/minecraftforge/forge/${mojangVersion}-${forgeMinorVersion}/forge-${mojangVersion}-${forgeMinorVersion}-client.jar`);
        } else {
            necessaryFiles.push(`net/minecraftforge/forge/${mojangVersion}-${forgeMinorVersion}/forge-${mojangVersion}-${forgeMinorVersion}.jar`);
        }

        for (let necessaryFile of necessaryFiles) {
            if (!fs.existsSync(path.join(gameLibrariesDirPath, necessaryFile))) return true;
        }

        return false;
    }

}