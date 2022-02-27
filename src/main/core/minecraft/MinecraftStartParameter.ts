import * as path from "path";
import * as os from "os";
import * as uuid from "uuid";

import Utils from "../utils/Utils";
import IMojangAssetsReturn from "../../interfaces/IMojangAssetsReturn";
import IServerLauncherReturn from "../../interfaces/IServerLauncherReturn";
import GlobalPath from "../io/GlobalPath";
import IForgeVersionLibraries from "../../interfaces/IForgeVersionLibraries";
import IGameLibraries from "../../interfaces/IGameLibraries";
import LauncherStore from "../io/LauncherStore";
import IParsingArgumentReturn from "../../interfaces/IParsingArgumentReturn";

import { LAUNCHER_VERSION } from "../../version";

export default class MinecraftStartParameter {

    private _serverAssetsObjects: IServerLauncherReturn;
    private _mojangAssetsGameJsonObjects: IMojangAssetsReturn;
    private _nativesDirPath: string;
    private _launcherVersion = LAUNCHER_VERSION;
    private _ioFile: LauncherStore;
    private _instanceDirPath;
    constructor(serverAssetsObjects: IServerLauncherReturn, mojangAssetsGameJsonObjects: IMojangAssetsReturn, ioFile: LauncherStore) {
        this._serverAssetsObjects = serverAssetsObjects;
        this._mojangAssetsGameJsonObjects = mojangAssetsGameJsonObjects;
        this._nativesDirPath = path.join(GlobalPath.getCommonDirPath(), "bin", uuid.v4().split("-")[0]);
        this._ioFile = ioFile;
        this._instanceDirPath = path.join(GlobalPath.getInstancesDirPath(), serverAssetsObjects.id, ".minecraft");
    }

    public getMinecraftJavaStartParameters(): { javaVMPath: string; nativesDirPath: string; nativesFilePaths: Array<string>; parameters: Array<string>; } {

        let array;

        if (Utils.isMcVersion("1.13", this._serverAssetsObjects.minecraftVersion)) {
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

        const builtInJavaVMDirPath = path.join(GlobalPath.getCommonDirPath(), "runtime", Utils.getOSType(), this._serverAssetsObjects.javaVM.version);

        let builtInJavaVMFilePath;

        if (Utils.getOSType() === "windows") {
            builtInJavaVMFilePath = path.join(builtInJavaVMDirPath, "bin", "javaw.exe");
        } else {
            builtInJavaVMFilePath = path.join(builtInJavaVMDirPath, "Contents", "Home", "bin", "java");
        }

        const serverId = this._serverAssetsObjects.id;
        const checked = this._ioFile.getJavaPathChecked(serverId);

        if (checked) {
            const isBuiltInJavaVM = this._ioFile.getIsBuiltInJavaVM(serverId);
            return isBuiltInJavaVM ? builtInJavaVMFilePath : this._ioFile.getJavaPath(serverId);
        } else {
            const isBuiltInJavaVM = this._ioFile.getIsBuiltInJavaVM("global");
            return isBuiltInJavaVM ? builtInJavaVMFilePath : this._ioFile.getJavaPath("global");
        }
    }

    private _getBuildArray_112later(): Array<string> {

        let minecraftArguments: string | null = null;
        let array = new Array();

        array = array.concat(this._jvm_112later());
        array = array.concat(this._jvmParameter());

        // if (this._isModLoaders()) {
        //     if (this._serverAssetsObjects.modLoader === undefined) throw new Error("Undefined serverLauncherJsonObjects modLoaders.");
        //     const forgeVersionJsonParser = new ForgeVersionJsonParser(this._serverAssetsObjects.modLoader?.forge?.versionJsonObject, this._serverAssetsObjects.minecraftVersion);
        //     array.push(forgeVersionJsonParser.mainClass); // forge
        // } else {

        //     array.push(this._mojangAssetsGameJsonObjects.mainClass); // minecraft

        // }

        // if (this._isModLoaders()) {
        //     if(this._serverAssetsObjects.modLoader === null) throw new Error("serverAssetsObjects 'modLoader' not null.");
        //     if(this._serverAssetsObjects.modLoader.modLoaderType === "Forge") {
        //         minecraftArguments = this._serverAssetsObjects.modLoader.startArguments.arguments as string;
        //     } else {
        //         minecraftArguments = "";
        //     }
        // } else {
        //     minecraftArguments = this._mojangAssetsGameJsonObjects.arguments as string; // minecraft
        // }


        if (this._isModLoaders()) {

            const modLoader = this._serverAssetsObjects.modLoader;
            if (modLoader === null) throw new Error("serverAssetsObjects 'modLoader' not null.");

            if (modLoader.modLoaderType === "Forge") {
                minecraftArguments = modLoader.startArguments.arguments as string;
                array.push(modLoader.startArguments.mainClass);
            } else if (modLoader.modLoaderType === "Fabric") {
                // fabric not 1.12
            }

        } else {
            array.push(this._mojangAssetsGameJsonObjects.mainClass);
            minecraftArguments = this._mojangAssetsGameJsonObjects.arguments as string;
        }

        if (minecraftArguments == null) throw new Error("minecraftArguments not null.");
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
                        val = this._ioFile.getAuthType() === "microsoft" ? this._ioFile.getMicrosoftMcAccountToken() : this._ioFile.getMinecraftAccessToken();
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

        let array = new Array<string>();
        let minecraftArguments: Array<any> | null = null;
        let argu = this._mojangAssetsGameJsonObjects.arguments as IParsingArgumentReturn;

        // jvm
        if(this._isModLoaders()) {
            const modLoader = this._serverAssetsObjects.modLoader;
            if (modLoader === null) throw new Error("serverAssetsObjects 'modLoader' not null.");
            array = array.concat(this._combinationModLoaderJvm(this._jvm_113above(argu.jvm), (modLoader.startArguments.arguments as { game: Array<string>, jvm: Array<string> }).jvm));
        } else {
            array = array.concat(this._jvm_113above(argu.jvm));
        }

        // parameter
        array = array.concat(this._jvmParameter());

        if (this._isModLoaders()) {

            const modLoader = this._serverAssetsObjects.modLoader;
            if (modLoader === null) throw new Error("serverAssetsObjects 'modLoader' not null.");

            array.push(modLoader.startArguments.mainClass); // modLoader
            minecraftArguments = argu.game.concat((modLoader.startArguments.arguments as { game: Array<string>, jvm: Array<string> }).game); // modLoader

            // if (modLoader.modLoaderType === "Forge") {
            //     minecraftArguments = argu.game.concat((modLoader.startArguments.arguments as { game: Array<string>, jvm: Array<string> }).game); // forge 1.13
            // } else if (modLoader.modLoaderType === "Fabric") {
            //     minecraftArguments = argu.game.concat((modLoader.startArguments.arguments as { game: Array<string>, jvm: Array<string> }).game); // fabric
            // }

        } else {
            array.push(this._mojangAssetsGameJsonObjects.mainClass); // minecraft
            minecraftArguments = argu.game; // minecraft
        }

        if (minecraftArguments === null) throw new Error("minecraftArguments not null.");
        array = array.concat(this._minecraftArguments_113later(minecraftArguments));

        return array;
    }

    private _combinationModLoaderJvm(minecraftJvm: Array<string>, modLoaderJvm: Array<string>): Array<string> {

        const array = new Array<string>();

        for(let jvm of modLoaderJvm) {
            if(jvm.indexOf("=") !== -1) {
                const jvmSplit = jvm.split("=");
                array.push(`${jvmSplit[0]}=${jvmSplit[1].replace(/^\s*|\s*$/g,"")}`);
            } else {
                array.push(jvm);
            }
        }

        return array.concat(minecraftJvm);
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
                        val = this._ioFile.getAuthType() === "microsoft" ? this._ioFile.getMicrosoftMcAccountToken() : this._ioFile.getMinecraftAccessToken();
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

        const ramSizeMax = this._ioFile.getRamSizeMax(this._serverAssetsObjects.id);
        const ramSizeMin = this._ioFile.getRamSizeMin(this._serverAssetsObjects.id);
        const javaParameter = this._ioFile.getJavaParameter(this._serverAssetsObjects.id);

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
                // TODO: 可能以後的版本會出錯
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
                            if (Array.isArray(item.value)) {
                                for (let value of item.value) {
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

            if (this._serverAssetsObjects.modLoader === null) throw new Error("Undefined serverLauncherJsonObjects modLoaders.");

            if (this._serverAssetsObjects.modLoader.modLoaderType === "Forge") {

                if (this._serverAssetsObjects.modLoader.forge === undefined) throw new Error("serverAssetsObjects 'modLoader forge' not null.");

                const modLoadersVersionJsonObjs = this._serverAssetsObjects.modLoader.forge.versionJsonObject;

                libPaths = this._forgeCombinationLibraries(modLoadersVersionJsonObjs.libraries, this._mojangAssetsGameJsonObjects.libraries);
                libPaths.push(path.join(GlobalPath.getCommonDirPath(), "libraries", modLoadersVersionJsonObjs.libraries[0].downloads.artifact.path));

            } else if (this._serverAssetsObjects.modLoader.modLoaderType === "Fabric") {

                if (this._serverAssetsObjects.modLoader.fabric === undefined) throw new Error("serverAssetsObjects 'modLoader fabric' not null.");

                const fabricLibraries = this._serverAssetsObjects.modLoader.startArguments.libraries;
                libPaths = this._fabricCombinationLibraries(fabricLibraries, this._mojangAssetsGameJsonObjects.libraries);

            }

            libPaths.push(path.join(GlobalPath.getCommonDirPath(), "versions", this._serverAssetsObjects.minecraftVersion.split("-")[0], `${this._serverAssetsObjects.minecraftVersion.split("-")[0]}.jar`));

        } else {

            libPaths = this._mojangAssetsGameJsonObjects.libraries.map((item) => item.filePath);
            libPaths.push(path.join(GlobalPath.getCommonDirPath(), "versions", this._serverAssetsObjects.minecraftVersion, `${this._serverAssetsObjects.minecraftVersion}.jar`));

        }

        if (Utils.getOSType() === "windows") {
            return libPaths.join(";");
        } else {
            return libPaths.join(":");
        }
    }

    private _fabricCombinationLibraries(fabricLibraries: Array<{ name: string; download: { fileName: string, filePath: string, sha1: string, size: number, download: { url: string } } }>, minecraftLibraries: Array<IGameLibraries>): Array<string> {

        let libraries = new Array<string>();

        for (let lib of fabricLibraries) {
            libraries.push(lib.download.filePath);
        }

        for (let lib of minecraftLibraries) {
            if (lib.libType === "artifact") {
                libraries.push(lib.filePath);
            }
        }

        return libraries;
    }
    private _forgeCombinationLibraries(forgeLibraries: Array<IForgeVersionLibraries>, minecraftLibraries: Array<IGameLibraries>): Array<string> {

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
    }

    private _isModLoaders(): boolean {
        return this._serverAssetsObjects.minecraftType === "minecraftModpack" || this._serverAssetsObjects.minecraftType === "minecraftModules";
    }

    private _getGameVersion(): string {
        if (this._isModLoaders()) {
            if (this._serverAssetsObjects.modLoader === null) throw new Error("serverAssetsObjects 'modLoaders' not null.");
            return this._serverAssetsObjects.modLoader.version;
        } else {
            return this._serverAssetsObjects.minecraftVersion;
        }
    }
}