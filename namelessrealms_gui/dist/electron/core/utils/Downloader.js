"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = require("fs-extra");
const path = require("path");
const stream = require("stream");
const got_1 = require("got");
const LoggerUtil_1 = require("./LoggerUtil");
class Downloader {
    static download(url, filePath, callback, options) {
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this._logger.info(`Download: ${url} -> path: ${filePath}`);
            fs.ensureDirSync(path.join(filePath, ".."));
            const gotStream = got_1.default.stream(url, {
                rejectUnauthorized: options !== undefined ? options.rejectUnauthorized : true
            });
            const fileWriterStream = fs.createWriteStream(filePath);
            if (callback !== undefined) {
                gotStream.on("downloadProgress", (progress) => {
                    if (progress.total <= 0 || progress.total === undefined) {
                        return;
                    }
                    callback(progress.percent);
                });
            }
            // gotStream.on("downloadProgress", (progress) => {
            //     const percentage = Math.round(progress.percent * 100);
            //     if(percentage === 0 || percentage === 100) {
            //         console.log(`${Utils.urlLastName(filePath)} | progress: ${progress.transferred}/${progress.total} (${percentage}%)`);
            //     }
            // });
            stream.pipeline(gotStream, fileWriterStream, (error) => {
                if (error) {
                    this._logger.error(`Fail download: ${url} -> path: ${filePath}`);
                    fs.unlinkSync(filePath);
                    return reject(error);
                }
                this._logger.info(`Complete download: ${url} -> path: ${filePath}`);
                return resolve();
            });
        }));
    }
}
exports.default = Downloader;
Downloader._logger = new LoggerUtil_1.default("Downloader");
//# sourceMappingURL=Downloader.js.map