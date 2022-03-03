import * as fs from "fs-extra";
import * as path from "path";
import * as admZip from "adm-zip";

import GlobalPath from "../io/GlobalPath";

export default class GameResourcePacks {

    public static getResourcePacks(serverId: string) {

        const serverResourcePacksDirPath = path.join(GlobalPath.getInstancesDirPath(), serverId, ".minecraft", "resourcepacks");

        let resourcePacks = new Array<{ fileName: string, filePath: string, imageSrc: string | undefined }>();

        if (fs.existsSync(serverResourcePacksDirPath)) {

            const resourcePacksDirData = fs.readdirSync(serverResourcePacksDirPath);

            if (resourcePacksDirData === undefined) {
                throw new Error("Undefined resourcePacksDirData.")
            }

            for (let resourcePackFileName of resourcePacksDirData) {

                const extensionName = path.extname(resourcePackFileName);

                if (extensionName === ".zip") {

                    const zip = new admZip(path.join(serverResourcePacksDirPath, resourcePackFileName));
                    const entries = zip.getEntries();
                    const packMcmetaFind = entries.find((item) => item.name === "pack.mcmeta");

                    if (packMcmetaFind !== undefined) {

                        const packImgBufferFind = entries.find((item) => item.name === "pack.png");

                        let imageSrc: string | undefined;

                        if (packImgBufferFind !== undefined) {
                            imageSrc = URL.createObjectURL(new Blob([packImgBufferFind.getData()], { type: "image/png" }))
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

    public static copyResourcePackFile(file: { name: string; path: string; }, serverId: string): void {
        const resourcepacksDir = path.join(GlobalPath.getInstancesDirPath(), serverId, ".minecraft", "resourcepacks");
        const extensionName = path.extname(file.name);
        if (extensionName === ".zip") {
            fs.ensureDir(resourcepacksDir);
            fs.copyFileSync(file.path, path.join(resourcepacksDir, file.name));
        }
    }

    public static resourcePackDelete(filePath: string): void {
        fs.removeSync(filePath);
    }
}