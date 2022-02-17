import Dates from "./Dates";
import log, { LevelOption } from "electron-log";

export default class LoggerUtil {

    // private readonly _format = {
    //     reset: "\x1b[0m",
    //     bright: "\x1b[1m",
    //     dim: "\x1b[2m",
    //     underscore: "\x1b[4m",
    //     blink: "\x1b[5m",
    //     reverse: "\x1b[7m",
    //     hidden: "\x1b[8m"
    // };

    // private readonly _colours = {
    //     fg: {
    //         black: "\x1b[30m",
    //         red: "\x1b[31m",
    //         green: "\x1b[32m",
    //         yellow: "\x1b[33m",
    //         blue: "\x1b[34m",
    //         magenta: "\x1b[35m",
    //         cyan: "\x1b[36m",
    //         white: "\x1b[37m",
    //         crimson: "\x1b[38m"
    //     },
    //     bg: {
    //         black: "\x1b[40m",
    //         red: "\x1b[41m",
    //         green: "\x1b[42m",
    //         yellow: "\x1b[43m",
    //         blue: "\x1b[44m",
    //         magenta: "\x1b[45m",
    //         cyan: "\x1b[46m",
    //         white: "\x1b[47m",
    //         crimson: "\x1b[48m"
    //     }
    // };

    private _prefix: string;

    constructor(prefix: string, disableWriteFile?: boolean) {
        this._prefix = prefix;
        if(disableWriteFile !== undefined && disableWriteFile) log.transports.file.level = false;
    }

    public info(...params: any[]): void {

        // let title: string = "INFO";
        // title = `${this._colours.fg.white}[${this._colours.fg.green}${title}${this._colours.fg.white}]${this._format.reset}`;
        // console.log(`${this._colours.fg.cyan}${Dates.fullYearTime()}`, title, message);

        log.transports.console.format = `[{h}:{i}:{s}][INFO][${this._prefix}] › {text}`;
        log.log(...params);
    }

    public warn(...params: any[]): void {

        // let title: string = "WARN";
        // title = `${this._colours.fg.white}[${this._colours.fg.yellow}${title}${this._colours.fg.white}]${this._format.reset}`;
        // console.log(`${this._colours.fg.cyan}${Dates.fullYearTime()}`, title, message);

        log.transports.console.format = `[{h}:{i}:{s}][WARN][${this._prefix}] › {text}`;
        log.warn(...params);
    }

    public error(...params: any[]): void {

        // let title: string = "ERROR";
        // title = `${this._colours.fg.white}[${this._colours.fg.red}${title}${this._colours.fg.white}]${this._format.reset}`;
        // console.log(`${this._colours.fg.cyan}${Dates.fullYearTime()}`, title, message);
        log.transports.console.format = `[{h}:{i}:{s}][ERROR][${this._prefix}] › {text}`;
        log.error(...params);
    }
}