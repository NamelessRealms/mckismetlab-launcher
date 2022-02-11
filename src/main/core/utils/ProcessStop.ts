export class Stop {

    private _message?: string;
    constructor(message?: string) {
        this._message = message;
    }
}

export class ProcessStop {

    private static _processMap = new Map<string, boolean>();

    public static setProcessStop(serverId: string, stop: boolean) {
        this._processMap.set(serverId, stop);
    }

    public static getProcessStop(serverId: string): boolean {

        const stop = this._processMap.get(serverId);

        if(stop === undefined) {
            return true;
        }

        return stop;
    }

    public static deleteProcessMap(serverId: string): void {
        this._processMap.delete(serverId);
    }

    public static isProcessStopped(serverId: string): boolean {
        return !this.getProcessStop(serverId);
    }

    public static isThrowProcessStopped(serverId: string) {
        if(!this.getProcessStop(serverId)) throw new Stop();
    }
}