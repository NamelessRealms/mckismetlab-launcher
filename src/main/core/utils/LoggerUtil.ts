import * as winston from "winston";
import * as path from "path";

import GlobalPath from "../io/GlobalPath";
import Dates from "./Dates";

export default class LoggerUtil {

    private _logger: winston.Logger;

    constructor(prefix: string) {
        const logsDirPath = path.join(GlobalPath.getCommonDirPath(), "logs");
        this._logger = winston.createLogger({
            format: winston.format.printf(({ level, message }) => {
                return `[${Dates.time()}][${level.toUpperCase()}][${prefix}]: ${message}`;
            }),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: path.join(logsDirPath, "error.log"), level: "error" }),
                new winston.transports.File({ filename: path.join(logsDirPath, "latest.log") }),
            ]
        });
    }

    public info(message: any): void {
        this._logger.info({ level: "info", message: message });
    }

    public warn(message: any): void {
        this._logger.info({ level: "warn", message: message });
    }

    public error(message: any): void {
        this._logger.info({ level: "warn", message: message });
    }
}