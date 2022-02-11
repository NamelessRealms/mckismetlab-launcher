import * as path from "path";
import * as fs from "fs-extra";

import GlobalPath from "../../io/GlobalPath";
import Utils from "../../utils/Utils";
import Downloader from "../../utils/Downloader";
import ForgeInstallProfileParser from "../../parser/ForgeInstallProfileParser";
import ProgressManager from "../../utils/ProgressManager";
import { ProgressTypeEnum } from "../../../enums/ProgressTypeEnum";
import ForgeVersionJsonParser from "../../parser/ForgeVersionJsonParser";

export default class ForgeHandler {

    private _commandDirPath: string;
    private _tempDirPath: string;
    private _mojangVersion: string;
    private _forgeVersion: string;
    private _forgeDownloadUrl: string;
    private _progressManager?: ProgressManager;

    constructor(serverId: string, mojangVersion: string, forgeInstance: { version: string; downloadUrl: string }, progressManager?: ProgressManager) {
        this._commandDirPath = GlobalPath.getCommonDirPath();
        this._tempDirPath = path.join(this._commandDirPath, "temp", serverId);
        this._mojangVersion = mojangVersion;
        this._forgeVersion = forgeInstance.version;
        this._forgeDownloadUrl = forgeInstance.downloadUrl;
        this._progressManager = progressManager;
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

            const tempForgeMavenDirPath = path.join(tempForgeDirPath, "maven");
            const tempForgeVersionJsonPath = path.join(tempForgeDirPath, "version.json");

            // download modLoaders file
            await Downloader.download(forgeDownloadUrl, tempForgeFileNamePath, (percent) => { if (this._progressManager !== undefined) { this._progressManager.set(ProgressTypeEnum.getModLoaderData, percent) } });

            // unFile modLoaders file
            await Utils.unZipFile(tempForgeFileNamePath, tempForgeDirPath);

            const forgeInstallProfileJsonObject = this._getInstallProfileObjJson(tempForgeDirPath);
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

    private _getInstallProfileObjJson(tempForgeDirPath?: string) {

        const versionInstallProfileObjFilePath = path.join(GlobalPath.getCommonDirPath(), "versions", this._forgeVersion, `${this._forgeVersion}_install_profile.json`)

        let forgeInstallProfileJsonObject;

        if (fs.existsSync(versionInstallProfileObjFilePath)) {
            forgeInstallProfileJsonObject = fs.readJSONSync(versionInstallProfileObjFilePath);
        } else {
            if (tempForgeDirPath === undefined) throw new Error("tempForgeDirPath not undefined.");
            const tempForgeInstallProfileJsonPath = path.join(tempForgeDirPath, "install_profile.json");
            forgeInstallProfileJsonObject = fs.readJSONSync(tempForgeInstallProfileJsonPath);
            fs.ensureDirSync(path.join(versionInstallProfileObjFilePath, ".."));
            fs.writeFileSync(versionInstallProfileObjFilePath, JSON.stringify(forgeInstallProfileJsonObject), "utf8");
        }

        return forgeInstallProfileJsonObject;
    }

    private _copyForgeVersionJsonFile(filePath: string, targetFilePath: string): void {
        fs.ensureDirSync(path.join(targetFilePath, ".."));
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

    public removeForgeDataHandler(): void {

        const modLoadersVersionDirPath = path.join(GlobalPath.getCommonDirPath(), "versions", this._forgeVersion);
        const forgeVersionJsonObjectPath = path.join(this._commandDirPath, "versions", this._forgeVersion, `${this._forgeVersion}.json`);
        const forgeVersionJsonObject = fs.readJSONSync(forgeVersionJsonObjectPath);
        const forgeVersionJsonParser = new ForgeVersionJsonParser(forgeVersionJsonObject, this._mojangVersion);

        for (let forgeLib of forgeVersionJsonParser.libraries) {
            const filePath = path.join(path.join(GlobalPath.getCommonDirPath(), "libraries"), forgeLib.downloads.artifact.path);
            if (fs.existsSync(filePath)) fs.removeSync(filePath);
        }

        if (Utils.isMcVersion("1.13", this._mojangVersion)) {

            const forgeInstallProfileJsonObject = this._getInstallProfileObjJson();
            const forgeInstallProfileParser = new ForgeInstallProfileParser(forgeInstallProfileJsonObject);

            for (let forgeInstallProfileLib of forgeInstallProfileParser.libraries) {
                const filePath = path.join(path.join(GlobalPath.getCommonDirPath(), "libraries"), forgeInstallProfileLib.downloads.artifact.path);
                if (fs.existsSync(filePath)) fs.removeSync(filePath);
            }
        }

        if (fs.existsSync(modLoadersVersionDirPath)) fs.removeSync(modLoadersVersionDirPath);
    }
}