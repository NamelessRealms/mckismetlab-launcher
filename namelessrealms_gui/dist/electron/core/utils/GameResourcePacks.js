"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const path = require("path");
const admZip = require("adm-zip");
const GlobalPath_1 = require("../io/GlobalPath");
class GameResourcePacks {
    static getResourcePacks(serverId) {
        const serverResourcePacksDirPath = path.join(GlobalPath_1.default.getInstancesDirPath(), serverId, ".minecraft", "resourcepacks");
        let resourcePacks = new Array();
        if (fs.existsSync(serverResourcePacksDirPath)) {
            const resourcePacksDirData = fs.readdirSync(serverResourcePacksDirPath);
            if (resourcePacksDirData === undefined) {
                throw new Error("Undefined resourcePacksDirData.");
            }
            for (let resourcePackFileName of resourcePacksDirData) {
                const extensionName = path.extname(resourcePackFileName);
                if (extensionName === ".zip") {
                    const zip = new admZip(path.join(serverResourcePacksDirPath, resourcePackFileName));
                    const entries = zip.getEntries();
                    const packMcmetaFind = entries.find((item) => item.name === "pack.mcmeta");
                    if (packMcmetaFind !== undefined) {
                        const packImgBufferFind = entries.find((item) => item.name === "pack.png");
                        let imageSrc;
                        if (packImgBufferFind !== undefined) {
                            imageSrc = URL.createObjectURL(new Blob([packImgBufferFind.getData()], { type: "image/png" }));
                        }
                        resourcePacks.push({
                            fileName: path.basename(resourcePackFileName, extensionName),
                            filePath: path.join(serverResourcePacksDirPath, resourcePackFileName),
                            imageSrc: imageSrc
                        });
                    }
                }
            }
        }
        return resourcePacks;
    }
    static copyResourcePackFile(file, serverId) {
        const resourcepacksDir = path.join(GlobalPath_1.default.getInstancesDirPath(), serverId, ".minecraft", "resourcepacks");
        const extensionName = path.extname(file.name);
        if (extensionName === ".zip") {
            fs.ensureDir(resourcepacksDir);
            fs.copyFileSync(file.path, path.join(resourcepacksDir, file.name));
        }
    }
    static resourcePackDelete(filePath) {
        fs.removeSync(filePath);
    }
}
exports.default = GameResourcePacks;
//# sourceMappingURL=GameResourcePacks.js.map