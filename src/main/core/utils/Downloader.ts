import * as fs from "fs-extra";
import * as path from "path";
import * as stream from "stream";
import got from "got";
import { ProgressTypeEnum } from "../../enums/ProgressTypeEnum";
import ProgressManager from "./ProgressManager";
import Utils from "./Utils";

export default class Downloader {

    public static download(url: string, filePath: string, callback?: (percent: number) => void): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {

            fs.ensureDirSync(path.join(filePath, ".."));

            const gotStream = got.stream(url);
            const fileWriterStream = fs.createWriteStream(filePath);

            if(callback !== undefined) {
                gotStream.on("downloadProgress", (progress) => {

                    if(progress.total <= 0 || progress.total === undefined) {
                        return;
                    }

                    // const percentage = Math.round(progress.percent * 100);
                    // console.log(`${Utils.urlLastName(filePath)} | progress: ${progress.transferred}/${progress.total} (${percentage}%)`);

                    callback(progress.percent);
                });
            }

            stream.pipeline(gotStream, fileWriterStream, (error: any) => {
                if(error) {
                    fs.unlinkSync(filePath);
                    return reject(error);
                }
                return resolve();
            });
        });
    }
}
