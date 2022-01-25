import * as path from "path";
import * as os from "os";
import * as uuid from "uuid";

import Utils from "../utils/Utils";
import IMojangAssetsReturn from "../../interfaces/IMojangAssetsReturn";
import IServerLauncherReturn from "../../interfaces/IServerLauncherReturn";
import GlobalPath from "../io/GlobalPath";
import IForgeVersionLibraries from "../../interfaces/IForgeVersionLibraries";
import IGameLibraries from "../../interfaces/IGameLibraries";
import IoFile from "../io/IoFile";
import IParsingArgumentReturn from "../../interfaces/IParsingArgumentReturn";
import ForgeVersionJsonParser from "../parser/ForgeVersionJsonParser";
import MicrosoftValidate from "../loginValidate/microsoft/MicrosoftValidate";

import { LAUNCHER_VERSION } from "../../version";

export default class MinecraftStartParameter {

    private _serverLauncherJsonObjects: IServerLauncherReturn;
    private _mojangAssetsGameJsonObjects: IMojangAssetsReturn;
    private _nativesDirPath: string;
    private _launcherVersion = LAUNCHER_VERSION;
    private _ioFile: IoFile;
    private _instanceDirPath;
    constructor(serverLauncherJsonObjects: IServerLauncherReturn, mojangAssetsGameJsonObjects: IMojangAssetsReturn, ioFile: IoFile) {
        this._serverLauncherJsonObjects = serverLauncherJsonObjects;
        this._mojangAssetsGameJsonObjects = mojangAssetsGameJsonObjects;
        this._nativesDirPath = path.join(GlobalPath.getCommonDirPath(), "bin", uuid.v4().split("-")[0]);
        this._ioFile = ioFile;
        this._instanceDirPath = path.join(GlobalPath.getInstancesDirPath(), serverLauncherJsonObjects.id, ".minecraft");
    }

    public getMinecraftJavaStartParameters(): { javaVMPath: string; nativesDirPath: string; nativesFilePaths: Array<string>; parameters: Array<string>; } {

        let array;

        if (Utils.isMcVersion("1.13", this._serverLauncherJsonObjects.minecraftVersion)) {
            array = this._getBuildArray_113above();
        } else {
            array = this._getBuildArray_112later();
        }

        return {
            javaVMPath: this._getJavaVMPath(),
            nativesDirPath: this._nativesDirPath,
            nativesFilePaths: this._getNativesFilePaths(),
            parameters: array
        }
    }

    private _getNativesFilePaths(): Array<string> {

        const array = this._mojangAssetsGameJsonObjects.libraries.filter((item) => item.libType === "natives");
        const paths = array.map((item) => item.filePath);

        return paths;
    }

    private _getJavaVMPath(): string {

        const builtInJavaVMDirPath = path.join(GlobalPath.getCommonDirPath(), "runtime", this._serverLauncherJsonObjects.java.version);

        let builtInJavaVMFilePath;
 
        if(Utils.getOSType() === "windows") {
            builtInJavaVMFilePath = path.join(builtInJavaVMDirPath, "bin", "javaw.exe");
        } else {
            builtInJavaVMFilePath = path.join(builtInJavaVMDirPath, "Contents", "Home", "bin", "java");
        }

        const serverId = this._serverLauncherJsonObjects.id;
        const checked = this._ioFile.getJavaPathChecked(serverId);

        if(checked) {
            const isBuiltInJavaVM = this._ioFile.getIsBuiltInJavaVM(serverId);
            return isBuiltInJavaVM ? builtInJavaVMFilePath : this._ioFile.getJavaPath(serverId);
        } else {
            const isBuiltInJavaVM = this._ioFile.getIsBuiltInJavaVM("global");
            return isBuiltInJavaVM ? builtInJavaVMFilePath : this._ioFile.getJavaPath("global");
        }
    }

    private _getBuildArray_112later(): Array<string> {

        let array = new Array();

        array = array.concat(this._jvm_112later());
        array = array.concat(this._jvmParameter());

        if (this._isModLoaders()) {
            if (this._serverLauncherJsonObjects.modLoaders === undefined) throw new Error("Undefined serverLauncherJsonObjects modLoaders.");
            const forgeVersionJsonParser = new ForgeVersionJsonParser(this._serverLauncherJsonObjects.modLoaders.versionJsonObject, this._serverLauncherJsonObjects.minecraftVersion);
            array.push(forgeVersionJsonParser.mainClass); // forge
        } else {

            array.push(this._mojangAssetsGameJsonObjects.mainClass); // minecraft

        }

        let minecraftArguments;

        if (this._isModLoaders()) {
            if (this._serverLauncherJsonObjects.modLoaders === undefined) throw new Error("Undefined serverLauncherJsonObjects modLoaders.");
            const forgeVersionJsonParser = new ForgeVersionJsonParser(this._serverLauncherJsonObjects.modLoaders.versionJsonObject, this._serverLauncherJsonObjects.minecraftVersion);
            minecraftArguments = forgeVersionJsonParser.minecraftArguments; // forge
        } else {
            minecraftArguments = this._mojangAssetsGameJsonObjects.arguments as string; // minecraft
        }

        array = array.concat(this._minecraftArguments_112later(minecraftArguments));

        return array;
    }

    private _minecraftArguments_112later(arg: string) {

        const argData = arg.split(" ");
        const argDiscovery = /\${*(.*)}/;

        let array = [];

        for (let i = 0; i < argData.length; i++) {

            let val = null;

            if (argDiscovery.test(argData[i])) {

                let argDataMatch = argData[i].match(argDiscovery) as RegExpMatchArray;
                let identifier = argDataMatch[1];

                switch (identifier) {
                    case "auth_player_name":
                        val = this._ioFile.getPlayerName();
                        break;
                    case "version_name":
                        val = this._getGameVersion();
                        break;
                    case "game_directory":
                        val = this._instanceDirPath;
                        break;
                    case "assets_root":
                        val = path.join(GlobalPath.getCommonDirPath(), "assets");
                        break;
                    case "assets_index_name":
                        val = this._mojangAssetsGameJsonObjects.assetsVersion;
                        break;
                    case "auth_uuid":
                        val = this._ioFile.getPlayerUuid();
                        break;
                    case "auth_access_token":
                        val = this._ioFile.getAuthType() === "microsoft" ? MicrosoftValidate.MCAccessToken : this._ioFile.getAccessToken();
                        break;
                    case "user_type":
                        val = "mojang";
                        break;
                    case "user_properties": // 1.8.9 以下版本需要
                        val = "{}";
                        break;
                    case "version_type":
                        val = this._mojangAssetsGameJsonObjects.versionType; // minecraft
                        break;
                }
            }

            // forge
            if (this._isModLoaders()) {
                if (argData[i - 1] === "--versionType") val = "Forge";
                if (argData[i - 1] === "--tweakClass") val = "net.minecraftforge.fml.common.launcher.FMLTweaker";
            }

            if (val !== null) {
                array.push(argData[i - 1]);
                array.push(val);
            }
        }

        return array;
    }

    private _jvm_112later(): Array<string> {

        const array = new Array<string>();

        array.push("-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump");

        if (os.arch() === "x86") array.push("-Xss1M");

        if (os.platform() === "win32" && os.release().split(".")[0] === "10") {
            array.push("-Dos.name=Windows 10");
            array.push("-Dos.version=10.0");
        }

        array.push("-Dminecraft.launcher.brand=mckismetlab-launcher");
        array.push("-Dminecraft.launcher.version=0.0.1");
        array.push("-Djava.library.path=" + this._nativesDirPath);

        array.push("-cp");
        array.push(this._combinationPath());

        return array;
    }

    private _getBuildArray_113above(): Array<string> {

        const argu = this._mojangAssetsGameJsonObjects.arguments as IParsingArgumentReturn;

        let array = new Array();

        array = array.concat(this._jvm_113above(argu.jvm));
        array = array.concat(this._jvmParameter());

        if (this._isModLoaders()) {
            if (this._serverLauncherJsonObjects.modLoaders === undefined) throw new Error("Undefined serverLauncherJsonObjects modLoaders.");
            const forgeVersionJsonParser = new ForgeVersionJsonParser(this._serverLauncherJsonObjects.modLoaders.versionJsonObject, this._serverLauncherJsonObjects.minecraftVersion);
            array.push(forgeVersionJsonParser.mainClass); // forge
        } else {
            array.push(this._mojangAssetsGameJsonObjects.mainClass); // minecraft
        }

        let minecraftArguments;

        if (this._isModLoaders()) {
            if (this._serverLauncherJsonObjects.modLoaders === undefined) throw new Error("Undefined serverLauncherJsonObjects modLoaders.");
            const forgeVersionJsonParser = new ForgeVersionJsonParser(this._serverLauncherJsonObjects.modLoaders.versionJsonObject, this._serverLauncherJsonObjects.minecraftVersion);
            minecraftArguments = argu.game = argu.game.concat(forgeVersionJsonParser.minecraftArguments.game); // forge 1.13
        } else {
            minecraftArguments = argu.game; // minecraft
        }

        array = array.concat(this._minecraftArguments_113later(minecraftArguments));

        return array;
    }

    private _minecraftArguments_113later(arg: Array<any>) {

        const argDiscovery = /\${*(.*)}/;

        let array = [];

        for (let i = 0; i < arg.length; i++) {

            let val = null;

            if (argDiscovery.test(arg[i])) {

                let identifier = arg[i].match(argDiscovery)[1];

                switch (identifier) {
                    case "auth_player_name":
                        val = this._ioFile.getPlayerName();
                        break;
                    case "version_name":
                        val = this._getGameVersion();
                        break;
                    case "game_directory":
                        val = this._instanceDirPath;
                        break;
                    case "assets_root":
                        val = path.join(GlobalPath.getCommonDirPath(), "assets");
                        break;
                    case "assets_index_name":
                        val = this._mojangAssetsGameJsonObjects.assetsVersion;
                        break;
                    case "auth_uuid":
                        val = this._ioFile.getPlayerUuid();
                        break;
                    case "auth_access_token":
                        val = this._ioFile.getAuthType() === "microsoft" ? MicrosoftValidate.MCAccessToken : this._ioFile.getAccessToken();
                        break;
                    case "user_type":
                        val = "mojang";
                        break;
                    case "version_type": {
                        val = this._mojangAssetsGameJsonObjects.versionType;
                        break;
                    }
                }
            }

            if (this._isModLoaders()) {
                switch (arg[i - 1]) {
                    case "--launchTarget":
                        val = arg[i];
                        break;
                    case "--fml.forgeVersion":
                        val = arg[i];
                        break;
                    case "--fml.mcVersion":
                        val = arg[i];
                        break;
                    case "--fml.forgeGroup":
                        val = arg[i];
                        break;
                    case "--fml.mcpVersion":
                        val = arg[i];
                        break;
                }
            }

            if (val !== null) {
                array.push(arg[i - 1]);
                array.push(val);
            }
        }

        return array;
    }

    private _jvmParameter(): Array<string> {

        let array = new Array<string>();

        const ramSizeMax = this._ioFile.getRamSizeMax(this._serverLauncherJsonObjects.id);
        const ramSizeMin = this._ioFile.getRamSizeMin(this._serverLauncherJsonObjects.id);
        const javaParameter = this._ioFile.getJavaParameter(this._serverLauncherJsonObjects.id);

        array.push(ramSizeMax !== 0 ? "-Xmx" + ramSizeMax + "M" : "-Xmx2048M");
        array.push(ramSizeMin !== 0 ? "-Xms" + ramSizeMin + "M" : "-Xms2048M");

        // let arrayJavaParameter;

        // if (javaParameter.length !== 0) {
        //     arrayJavaParameter = javaParameter.split(" ");
        // } else {
        //     const defaultJavaParameter = "-d64 -XX:MaxGCPauseMillis=1 -XX:LargePageSizeInBytes=1m -XX:-UseGCOverheadLimit -XX:+AggressiveOpts -XX:+UseParNewGC -XX:+DisableExplicitGC -Xnoclassgc -XX:+CMSIncrementalPacing -XX:+UseConcMarkSweepGC -XX:UseSSE=3 -XX:ParallelGCThreads=10";
        //     arrayJavaParameter = defaultJavaParameter.split(" ");
        // }

        // for (let item of arrayJavaParameter) {
        //     array.push(item);
        // }

        return array;
    }

    private _jvm_113above(argu: Array<any>) {

        let array = [];

        for (let item of argu) {

            if (item.rules !== undefined) {
                // TODO: 可能以後的版本可能會出錯
                if (item.rules[0].action === "allow") {
                    if (item.rules[0].os.name === Utils.getOSType()) {
                        if ("version" in item.rules[0].os) {
                            if (item.rules[0].os.version.match(/\d+/)[0] === os.release().split(".")[0]) {
                                for (let data of item.value) {
                                    array.push(data);
                                }
                            }
                        } else if ("arch" in item.rules[0].os && os.arch() === "x86") {
                            array.push("-Xss1M");
                        } else {
                            if(Array.isArray(item.value)) {
                                for(let value of item.value) {
                                    array.push(value);
                                }
                            } else {
                                array.push(item.value);
                            }
                        }
                    }
                }

            } else {

                let original = item.split("=")[0];
                let identifier = item.match(/\${*(.*)}/);

                if (original === "-cp") array.push("-cp");

                let val = null;

                if (identifier !== null) {
                    switch (identifier[1]) {
                        case "natives_directory":
                            val = `${original}=${this._nativesDirPath}`;
                            break;
                        case "launcher_name":
                            val = `${original}=mckismetlab-launcher`;
                            break;
                        case "launcher_version":
                            val = `${original}=${this._launcherVersion}`;
                            break;
                        case "classpath":
                            val = this._combinationPath();
                            break;
                    }

                    if (val !== null) {
                        array.push(val);
                    }
                }
            }
        }

        return array;
    }

    private _combinationPath(): string {

        let libPaths: Array<string> = new Array<string>();

        // this.arrayClassPath.forEach((item, index: number) => {
        //   if (item.type === "general") {
        //     if (index === 0) {
        //       libPath = item.path;
        //     } else {
        //       // TODO: OSX
        //       libPath += ";" + item.path;
        //     }
        //   }
        // });

        if (this._isModLoaders()) {

            if (this._serverLauncherJsonObjects.modLoaders === undefined) throw new Error("Undefined serverLauncherJsonObjects modLoaders.");
            const modLoadersVersionJsonObjs = this._serverLauncherJsonObjects.modLoaders.versionJsonObject;

            libPaths = this._combinationLibraries(modLoadersVersionJsonObjs.libraries, this._mojangAssetsGameJsonObjects.libraries);
            libPaths.push(path.join(GlobalPath.getCommonDirPath(), "libraries", modLoadersVersionJsonObjs.libraries[0].downloads.artifact.path));
            libPaths.push(path.join(GlobalPath.getCommonDirPath(), "versions", this._serverLauncherJsonObjects.minecraftVersion.split("-")[0], `${this._serverLauncherJsonObjects.minecraftVersion.split("-")[0]}.jar`));

            // libPath = this._combinationLibraries(modLoadersVersionJsonObjs.libraries, this._mojangAssetsGameJsonObjects.libraries);
            // libPath = `${libPath};${path.join(GlobalPath.getCommonDirPath(), "libraries", modLoadersVersionJsonObjs.libraries[0].downloads.artifact.path)}`;
            // libPath = `${libPath};${GlobalPath.getCommonDirPath()}\\versions\\${this._serverLauncherJsonObjects.minecraftVersion.split("-")[0]}\\${this._serverLauncherJsonObjects.minecraftVersion.split("-")[0]}.jar`;
        } else {

            libPaths = this._mojangAssetsGameJsonObjects.libraries.map((item) => item.filePath);
            libPaths.push(path.join(GlobalPath.getCommonDirPath(), "versions", this._serverLauncherJsonObjects.minecraftVersion, `${this._serverLauncherJsonObjects.minecraftVersion}.jar`));

            // libPath = this._mojangAssetsGameJsonObjects.libraries.join(";");
            // libPath = `${libPath};${GlobalPath.getCommonDirPath()}\\versions\\${this._serverLauncherJsonObjects.minecraftVersion}\\${this._serverLauncherJsonObjects.minecraftVersion}.jar`;
        }

        if (Utils.getOSType() === "windows") {
            return libPaths.join(";");
        } else {
            return libPaths.join(":");
        }
    }

    private _combinationLibraries(forgeLibraries: Array<IForgeVersionLibraries>, minecraftLibraries: Array<IGameLibraries>): Array<string> {

        let libraries = new Array<string>();

        for (let lib of forgeLibraries) {
            if (lib.downloads.artifact.url.length !== 0) {
                libraries.push(path.join(GlobalPath.getCommonDirPath(), "libraries", lib.downloads.artifact.path));
            }
        }

        for (let lib of minecraftLibraries) {
            if (lib.libType === "artifact") {
                libraries.push(lib.filePath);
            }
        }

        return libraries;

        // if(Utils.getOSType() === "windows") {
        //     return libraries.join(";");
        // } else {
        //     return libraries.join(":");
        // }
    }

    private _isModLoaders(): boolean {
        return this._serverLauncherJsonObjects.minecraftType === "minecraftModpack" || this._serverLauncherJsonObjects.minecraftType === "minecraftModules";
    }

    private _getGameVersion(): string {
        if (this._isModLoaders()) {
            if (this._serverLauncherJsonObjects.modLoaders === undefined) throw new Error("Undefined serverLauncherJsonObjects modLoaders.");
            return this._serverLauncherJsonObjects.modLoaders.forgeVersion;
        } else {
            return this._serverLauncherJsonObjects.minecraftVersion;
        }
    }
}