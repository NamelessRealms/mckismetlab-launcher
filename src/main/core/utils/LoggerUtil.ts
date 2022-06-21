import * as winston from "winston";
import * as path from "path";

import GlobalPath from "../io/GlobalPath";
import Dates from "./Dates";

export default class LoggerUtil {

    private _prefix: string;
    private _logger: winston.Logger;

    constructor(prefix: string) {
        this._prefix = prefix;
        const logsDirPath = path.join(GlobalPath.getCommonDirPath(), "logs");
        this._logger = winston.createLogger({
            format: winston.format.printf(({ level, message }) => {
                return `[${Dates.time()}][${level.toUpperCase()}][${prefix}]: ${message}`;
            }),
            transports: [
                new winston.transports.File({ filename: path.join(logsDirPath, "error.log"), level: "error", maxFiles: 10, maxsize: 1000000, tailable: true }),
                new winston.transports.File({ filename: path.join(logsDirPath, "latest.log"), maxFiles: 10, maxsize: 1000000, tailable: true }),
            ]
        });
        if(process.env.NODE_ENV === "development") {
            this._logger.add(new winston.transports.Console());
        }
    }

    public setFormat(type: "noTimeLevelPrefix" | "minecraft"): LoggerUtil {
        switch (type) {
            case "noTimeLevelPrefix":
                this._logger.format = winston.format.printf(({ level, message }) => {
                    return `${message}`;
                });
                break;
            case "minecraft":
                this._logger.format = winston.format.printf(({ level, message }) => {
                    return `[${this._prefix}] ${message}`;
                });
                break;
        }

        return this;
    }

    public info(message: any): void {
        this._logger.info({ level: "info", message: message });
    }

    public warn(message: any): void {
        this._logger.warn({ level: "warn", message: message });
    }

    public error(message: any): void {

        if(message.stack) {
            message = message.stack
        }

        this._logger.error({ level: "error", message: message });
    }
}