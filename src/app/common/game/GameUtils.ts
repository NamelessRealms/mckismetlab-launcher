export default class GameUtils {

    public static isGameStart(serverId: string): boolean {

        const instance = window.electron.game.instance;
        const state = instance.getState(serverId);

        if (state === "onStandby" || state === "close" || state === "closeError" || state === "startError") {
            return false;
        }

        return true;
    }
}