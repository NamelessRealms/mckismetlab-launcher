import * as fs from "fs-extra";
import * as path from "path";
import * as stream from "stream";
import got from "got";
import { ProgressTypeEnum } from "../../enums/ProgressTypeEnum";
import ProgressManager from "./ProgressManager";
import Utils from "./Utils";
import LoggerUtil from "./LoggerUtil";

export default class Downloader {

    private static _logger: LoggerUtil = new LoggerUtil("Downloader");

    public static download(url: string, filePath: string, callback?: (percent: number) => void, options?: { rejectUnauthorized: boolean }): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {

            this._logger.info(`Download: ${url} -> path: ${filePath}`);

            fs.ensureDirSync(path.join(filePath, ".."));

            const gotStream = got.stream(url, {
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

            stream.pipeline(gotStream, fileWriterStream, (error: any) => {

                if (error) {
                    this._logger.error(`Fail download: ${url} -> path: ${filePath}`);
                    fs.unlinkSync(filePath);
                    return reject(error);
                }

                this._logger.info(`Complete download: ${url} -> path: ${filePath}`);
                return resolve();
            });
        });
    }
}
