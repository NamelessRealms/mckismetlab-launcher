export default class Dates {

    public static time(): string {

        const date: Date = new Date();
        const hours = date.getHours().toString();
        const minutes = date.getMinutes().toString();
        const seconds = date.getSeconds().toString();

        return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
    }

    public static fullYearTime(): string {

        const date: Date = new Date();

        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString();
        const day = date.getDate().toString();
        const hours = date.getHours().toString();
        const minutes = date.getMinutes().toString();
        const seconds = date.getSeconds().toString();

        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")} ${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
    }

    public static dateTime(): string {

        const date: Date = new Date();

        const month = (date.getMonth() + 1).toString();
        const day = date.getDate().toString();
        const hours = date.getHours().toString();
        const minutes = date.getMinutes().toString();
        const seconds = date.getSeconds().toString();

        return `${month.padStart(2, "0")}/${day.padStart(2, "0")} ${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
    }
}