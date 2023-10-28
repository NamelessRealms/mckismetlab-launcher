"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const path = require("path");
const GlobalPath_1 = require("../io/GlobalPath");
const InstanceStore_1 = require("../io/InstanceStore");
class GameModule {
    constructor(serverId, ioFile) {
        this._serverId = serverId;
        this._ioFile = ioFile;
    }
    getModules() {
        const serverModulesDirPath = path.join(GlobalPath_1.default.getInstancesDirPath(), this._serverId, ".minecraft", "mods");
        let modules = new Array();
        if (this._isInstanceModuleDir(serverModulesDirPath)) {
            const instanceModulesDirData = fs.readdirSync(serverModulesDirPath);
            if (instanceModulesDirData === undefined) {
                throw new Error("Undefined instanceModulesDirData!");
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
    _isInstanceModuleDir(serverModulesDirPath) {
        return fs.existsSync(serverModulesDirPath);
    }
    static moduleEnableDisable(filePath, status) {
        const serverModulesPath = path.join(filePath, "..");
        const moduleName = path.basename(filePath);
        const extensionName = path.extname(moduleName);
        let newPath;
        if (status) {
            newPath = path.join(serverModulesPath, `${path.basename(moduleName, extensionName)}.jar`);
        }
        else {
            newPath = path.join(serverModulesPath, `${path.basename(moduleName, extensionName)}.disabled`);
        }
        fs.moveSync(filePath, newPath);
        return newPath;
    }
    static addModuleRevise(filePath, serverId) {
        const instanceIo = new InstanceStore_1.default(serverId);
        let modules = instanceIo.getModules();
        modules = modules.map(module => {
            if (module.filePath === filePath)
                module.userRevert = true;
            return module;
        });
        instanceIo.setModules(modules);
        instanceIo.save();
    }
    static moduleDelete(filePath) {
        fs.removeSync(filePath);
    }
    static copyModuleFile(file, serverId) {
        const extensionName = path.extname(file.name);
        if (extensionName === ".jar" || extensionName === ".disabled") {
            fs.copyFileSync(file.path, path.join(GlobalPath_1.default.getInstancesDirPath(), serverId, ".minecraft", "mods", file.name));
        }
    }
}
exports.default = GameModule;
//# sourceMappingURL=GameModule.js.map