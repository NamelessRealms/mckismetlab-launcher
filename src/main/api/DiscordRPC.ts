import LoggerUtil from "../core/utils/LoggerUtil";
import * as discordRpc from "discord-rpc";
import Config from "../config/Configs";
import { LAUNCHER_VERSION } from "../version";

export default class DiscordRPC {

    private static readonly _logger = new LoggerUtil("DiscordRPC");
    public static client: discordRpc.Client = new discordRpc.Client({ transport: "ipc" });

    public static initRpc(): void {

        this._logger.info("初始化 Discord RPC...");

        this.client.on("ready", () => {

            this._logger.info("Discord RPC Connected.");

            this.client.setActivity({
                details: "無名啟動器 (BETA)",
                state: "伺服器: 無名伺服器 - mcKismetLab",
                startTimestamp: new Date(),
                largeImageKey: "logo",
                largeImageText: "無名啟動器 幫助你快速方便啟動遊戲，無需你自己安裝模組包",
                smallImageKey: "minecraft",
                smallImageText: LAUNCHER_VERSION
            });
        });

        this.client.login({ clientId: Config.discordRpcClientId }).catch((error) => {
            if (error.message.includes("ENOENT")) {
                this._logger.warn("Unable to initialize Discord Rich Presence, no client detected.");
            } else {
                this._logger.warn(`Unable to initialize Discord Rich Presence: ${error.message} ${error}`);
            }
        });
    }
}