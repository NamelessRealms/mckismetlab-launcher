"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston = require("winston");
const path = require("path");
const GlobalPath_1 = require("../io/GlobalPath");
const Dates_1 = require("./Dates");
class LoggerUtil {
    constructor(prefix) {
        this._prefix = prefix;
        const logsDirPath = path.join(GlobalPath_1.default.getCommonDirPath(), "logs");
        this._logger = winston.createLogger({
            format: winston.format.printf(({ level, message }) => {
                return `[${Dates_1.default.time()}][${level.toUpperCase()}][${prefix}]: ${message}`;
            }),
            transports: [
                new winston.transports.File({ filename: path.join(logsDirPath, "error.log"), level: "error", maxFiles: 10, maxsize: 1000000, tailable: true }),
                new winston.transports.File({ filename: path.join(logsDirPath, "latest.log"), maxFiles: 10, maxsize: 1000000, tailable: true }),
            ]
        });
        if (process.env.NODE_ENV === "development") {
            this._logger.add(new winston.transports.Console());
        }
    }
    setFormat(type) {
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
    info(message) {
        this._logger.info({ level: "info", message: message });
    }
    warn(message) {
        this._logger.warn({ level: "warn", message: message });
    }
    error(message) {
        if (message.stack) {
            message = message.stack;
        }
        this._logger.error({ level: "error", message: message });
    }
}
exports.default = LoggerUtil;
//# sourceMappingURL=LoggerUtil.js.map