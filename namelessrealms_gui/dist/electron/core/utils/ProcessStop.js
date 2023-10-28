"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessStop = exports.Stop = void 0;
class Stop {
    constructor(message) {
        this._message = message;
    }
}
exports.Stop = Stop;
class ProcessStop {
    static setProcessStop(serverId, stop) {
        this._processMap.set(serverId, stop);
    }
    static getProcessStop(serverId) {
        const stop = this._processMap.get(serverId);
        if (stop === undefined) {
            return true;
        }
        return stop;
    }
    static deleteProcessMap(serverId) {
        this._processMap.delete(serverId);
    }
    static isProcessStopped(serverId) {
        return !this.getProcessStop(serverId);
    }
    static isThrowProcessStopped(serverId) {
        if (!this.getProcessStop(serverId))
            throw new Stop();
    }
}
exports.ProcessStop = ProcessStop;
ProcessStop._processMap = new Map();
//# sourceMappingURL=ProcessStop.js.map