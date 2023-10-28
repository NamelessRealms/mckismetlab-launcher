"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Dates {
    static time() {
        const date = new Date();
        const hours = date.getHours().toString();
        const minutes = date.getMinutes().toString();
        const seconds = date.getSeconds().toString();
        return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
    }
    static fullYearTime() {
        const date = new Date();
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString();
        const day = date.getDate().toString();
        const hours = date.getHours().toString();
        const minutes = date.getMinutes().toString();
        const seconds = date.getSeconds().toString();
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")} ${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
    }
    static dateTime() {
        const date = new Date();
        const month = (date.getMonth() + 1).toString();
        const day = date.getDate().toString();
        const hours = date.getHours().toString();
        const minutes = date.getMinutes().toString();
        const seconds = date.getSeconds().toString();
        return `${month.padStart(2, "0")}/${day.padStart(2, "0")} ${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
    }
}
exports.default = Dates;
//# sourceMappingURL=Dates.js.map