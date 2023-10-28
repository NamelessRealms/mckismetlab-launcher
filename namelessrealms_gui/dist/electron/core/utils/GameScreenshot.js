"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const path = require("path");
const GlobalPath_1 = require("../io/GlobalPath");
class GameScreenshot {
    static getScreenshots(serverId) {
        const serverScreenshotsDirPath = path.join(GlobalPath_1.default.getInstancesDirPath(), serverId, ".minecraft", "screenshots");
        let resourcePacks = new Array();
        if (fs.existsSync(serverScreenshotsDirPath)) {
            const screenshotsDirData = fs.readdirSync(serverScreenshotsDirPath);
            if (screenshotsDirData === undefined) {
                throw new Error("Undefined resourcePacksDirData.");
            }
            for (let screenshotFileName of screenshotsDirData) {
                const extensionName = path.extname(screenshotFileName);
                if (extensionName === ".png") {
                    const imagePath = path.join(serverScreenshotsDirPath, screenshotFileName);
                    const imageSrc = URL.createObjectURL(new Blob([fs.readFileSync(imagePath)], { type: "image/png" }));
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
    static screenshotDelete(filePath) {
        fs.removeSync(filePath);
    }
}
exports.default = GameScreenshot;
//# sourceMappingURL=GameScreenshot.js.map