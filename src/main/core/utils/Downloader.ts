import * as fs from "fs-extra";
import * as path from "path";
import * as stream from "stream";
import got from "got";
import Utils from "./Utils";

// import axios from "../interceptors/axios.interceptor";

export default class Downloader {

    public static download(url: string, filePath: string): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {

            fs.ensureDirSync(path.join(filePath, ".."));

            const gotStream = got.stream(url);
            const fileWriterStream = fs.createWriteStream(filePath);

            gotStream.on("downloadProgress", (progress) => {
                const percentage = Math.round(progress.percent * 100);
                console.log(`${Utils.urlLastName(filePath)} | progress: ${progress.transferred}/${progress.total} (${percentage}%)`);
            });

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
