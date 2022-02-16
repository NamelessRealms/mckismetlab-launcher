import * as path from "path";
import * as fs from "fs-extra";

import GlobalPath from "../../io/GlobalPath";
import Utils from "../../utils/Utils";
import Downloader from "../../utils/Downloader";
import ForgeInstallProfileParser from "../../parser/ForgeInstallProfileParser";
import ProgressManager from "../../utils/ProgressManager";
import { ProgressTypeEnum } from "../../../enums/ProgressTypeEnum";
import ForgeVersionJsonParser from "../../parser/ForgeVersionJsonParser";
import IForgeAssets from "../../../interfaces/IForgeAssets";

interface IForgeParser {
    data: any;
    libraries: Array<{
        name: string;
        download: {
            fileName: string;
            filePath: string;
            sha1: string;
            size: number;
            download: {
                url: string;
            }
        }
    }>;
    processors: any;
    clientLzmaPath: string;
}
export default class ForgeHandler {

    private _commandDirPath: string;
    private _tempDirPath: string;
    private _mojangVersion: string;
    private _forgeId: string;
    private _progressManager: ProgressManager;

    constructor(serverId: string, mojangVersion: string, forgeId: string, progressManager: ProgressManager) {
        this._commandDirPath = GlobalPath.getCommonDirPath();
        this._tempDirPath = path.join(GlobalPath.getInstancesDirPath(), serverId, ".TEMP");
        this._mojangVersion = mojangVersion;
        this._forgeId = forgeId;
        this._progressManager = progressManager;
    }
    public async forgeHandlerParser(): Promise<IForgeAssets> {

        const tempForgeDirPath = path.join(this._tempDirPath, "ForgeModLoader");
        const forgeVersionJsonObjectPath = path.join(this._commandDirPath, "versions", this._getForgeVersion(), `${this._getForgeVersion()}.json`);

        if (this._validateForgeJar()) {

            const forgeInstallProfile = await this._doForgeParser(tempForgeDirPath, forgeVersionJsonObjectPath, this._getForgeDownloadUrl());
            const forgeVersionJsonObject = fs.readJSONSync(forgeVersionJsonObjectPath);
            const forgeVersionJsonParser = new ForgeVersionJsonParser(forgeVersionJsonObject, this._mojangVersion);
            return {
                isInstall: true,
                versionJsonObject: forgeVersionJsonObject,
                installProfile: forgeInstallProfile,
                version: this._getForgeVersion(),
                arguments: forgeVersionJsonParser.minecraftArguments,
                mainClass: forgeVersionJsonParser.mainClass,
                libraries: this._parsingModLoadersLibraries(forgeVersionJsonParser.libraries)
            };

        } else {

            const forgeVersionJsonObject = fs.readJSONSync(forgeVersionJsonObjectPath);
            const forgeVersionJsonParser = new ForgeVersionJsonParser(forgeVersionJsonObject, this._mojangVersion);
            return {
                isInstall: false,
                versionJsonObject: forgeVersionJsonObject,
                version: this._getForgeVersion(),
                arguments: forgeVersionJsonParser.minecraftArguments,
                mainClass: forgeVersionJsonParser.mainClass,
                libraries: this._parsingModLoadersLibraries(forgeVersionJsonParser.libraries)
            };

        }
    }

    private async _doForgeParser(tempForgeDirPath: string, forgeVersionJsonObjectPath: string, forgeDownloadUrl: string): Promise<IForgeParser | undefined> {

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
            return {
                data: forgeInstallProfileParser.data,
                libraries: this._parsingModLoadersLibraries(forgeInstallProfileParser.libraries),
                processors: forgeInstallProfileParser.processors,
                clientLzmaPath: tempClientLzmaFilePath
            };
        }

        return undefined;
    }

    private _parsingModLoadersLibraries(libraries: Array<{ name: string; downloads: { artifact: { path: string; url: string; sha1: string; size: number } } }>): Array<{ name: string; download: { fileName: string, filePath: string, sha1: string, size: number, download: { url: string } } }> {

        let librariesData = new Array <{ name: string; download: { fileName: string, filePath: string, sha1: string, size: number, download: { url: string } } }>();

        for (let lib of libraries) {
            if (lib.downloads.artifact.url.length !== 0) {
                librariesData.push({
                    name: lib.name,
                    download: {
                        fileName: Utils.urlLastName(lib.downloads.artifact.path) as string,
                        filePath: path.join(path.join(GlobalPath.getCommonDirPath(), "libraries"), lib.downloads.artifact.path),
                        sha1: lib.downloads.artifact.sha1,
                        size: lib.downloads.artifact.size,
                        download: {
                            url: lib.downloads.artifact.url
                        }
                    }
                });
            }
        }

        return librariesData;
    }

    private _getInstallProfileObjJson(tempForgeDirPath?: string) {

        const versionInstallProfileObjFilePath = path.join(GlobalPath.getCommonDirPath(), "versions", this._getForgeVersion(), `${this._getForgeVersion()}_install_profile.json`)

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

    private _validateForgeJar(): boolean {

        const gameLibrariesDirPath = path.join(this._commandDirPath, "libraries");
        // ["forge", "36.2.8"]
        const forgeVersionSplit = this._forgeId.split("-");
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

    private _getForgeDownloadUrl(): string {
        // https://maven.minecraftforge.net/net/minecraftforge/forge/1.18.1-39.0.76/forge-1.18.1-39.0.76-installer.jar
        const forgeIdSplit = this._forgeId.split("-");
        return `https://maven.minecraftforge.net/net/minecraftforge/forge/${this._mojangVersion}-${forgeIdSplit[1]}/${forgeIdSplit[0]}-${this._mojangVersion}-${forgeIdSplit[1]}-installer.jar`;
    }

    private _getForgeVersion(): string {
        return `${this._mojangVersion}-${this._forgeId.split("-")[1]}`;
    }

    public removeForgeDataHandler(): void {

        const modLoadersVersionDirPath = path.join(GlobalPath.getCommonDirPath(), "versions", this._getForgeVersion());
        const forgeVersionJsonObjectPath = path.join(this._commandDirPath, "versions", this._getForgeVersion(), `${this._getForgeVersion()}.json`);
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