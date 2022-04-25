import * as fs from "fs-extra";
import * as path from "path";

import GlobalPath from "../io/GlobalPath";
import LauncherStore from "../io/LauncherStore";
import InstanceStore from "../io/InstanceStore";

export default class GameModule {

    private _serverId: string;
    private _ioFile: LauncherStore;

    constructor(serverId: string, ioFile: LauncherStore) {
        this._serverId = serverId;
        this._ioFile = ioFile;
    }

    public getModules() {

        const serverModulesDirPath = path.join(GlobalPath.getInstancesDirPath(), this._serverId, ".minecraft", "mods");

        let modules = new Array<{ fileName: string, filePath: string, state: boolean, hidden: boolean }>();

        if (this._isInstanceModuleDir(serverModulesDirPath)) {

            const instanceModulesDirData = fs.readdirSync(serverModulesDirPath);

            if (instanceModulesDirData === undefined) {
                throw new Error("Undefined instanceModulesDirData!")
            }

            for (let moduleData of instanceModulesDirData) {

                const extensionName = path.extname(moduleData);

                if (extensionName === ".jar" || extensionName === ".disabled") {

                    modules.push({
                        fileName: path.basename(moduleData, extensionName),
                        filePath: path.join(serverModulesDirPath, moduleData),
                        state: extensionName === ".jar",
                        hidden: true
                    });

                }
            }

        }

        return modules;
    }

    private _isInstanceModuleDir(serverModulesDirPath: string): boolean {
        return fs.existsSync(serverModulesDirPath);
    }

    public static moduleEnableDisable(filePath: string, status: boolean): string {

        const serverModulesPath = path.join(filePath, "..");
        const moduleName = path.basename(filePath);
        const extensionName = path.extname(moduleName);

        let newPath;

        if (status) {
            newPath = path.join(serverModulesPath, `${path.basename(moduleName, extensionName)}.jar`);
        } else {
            newPath = path.join(serverModulesPath, `${path.basename(moduleName, extensionName)}.disabled`);
        }

        fs.moveSync(filePath, newPath);

        return newPath;
    }

    public static addModuleRevise(filePath: string, serverId: string) {
        const instanceIo = new InstanceStore(serverId);
        let modules = instanceIo.getModules();
        modules = modules.map(module => {
            if(module.filePath === filePath) module.userRevert = true;
            return module;
        });
        instanceIo.setModules(modules);
        instanceIo.save();
    }

    public static moduleDelete(filePath: string): void {
        fs.removeSync(filePath);
    }

    public static copyModuleFile(file: { name: string; path: string; }, serverId: string): void {
        const extensionName = path.extname(file.name);
        if (extensionName === ".jar" || extensionName === ".disabled") {
            fs.copyFileSync(file.path, path.join(GlobalPath.getInstancesDirPath(), serverId, ".minecraft", "mods", file.name));
        }
    }
}