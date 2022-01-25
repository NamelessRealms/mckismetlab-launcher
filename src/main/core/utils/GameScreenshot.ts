import * as fs from "fs-extra";
import * as path from "path";

import GlobalPath from "../io/GlobalPath";

export default class GameScreenshot {

    public static getScreenshots(serverId: string) {

        const serverScreenshotsDirPath = path.join(GlobalPath.getInstancesDirPath(), serverId, ".minecraft", "screenshots");

        let resourcePacks = new Array<{ fileName: string, filePath: string, imageSrc: string | undefined }>();

        if(fs.existsSync(serverScreenshotsDirPath)) {

            const screenshotsDirData = fs.readdirSync(serverScreenshotsDirPath);

            if (screenshotsDirData === undefined) {
                throw new Error("Undefined resourcePacksDirData.")
            }

            for(let screenshotFileName of screenshotsDirData) {
                
                const extensionName = path.extname(screenshotFileName);

                if(extensionName === ".png") {

                    const imagePath = path.join(serverScreenshotsDirPath, screenshotFileName);
                    const imageSrc = URL.createObjectURL(new Blob([fs.readFileSync(imagePath)], { type: "image/png" }))

                    resourcePacks.push({
                        fileName: path.basename(screenshotFileName, extensionName),
                        filePath: imagePath,
                        imageSrc: imageSrc
                    });
                }
            }

        }

        return resourcePacks;
    }

    public static screenshotDelete(filePath: string) {
        fs.removeSync(filePath);
    }
}