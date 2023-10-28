"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LoggerUtil_1 = require("../core/utils/LoggerUtil");
const discordRpc = require("discord-rpc");
const Configs_1 = require("../config/Configs");
const version_1 = require("../version");
class DiscordRPC {
    static initRpc() {
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
                smallImageText: version_1.LAUNCHER_VERSION
            });
        });
        this.client.login({ clientId: Configs_1.default.discordRpcClientId }).catch((error) => {
            if (error.message.includes("ENOENT")) {
                this._logger.warn("Unable to initialize Discord Rich Presence, no client detected.");
            }
            else {
                this._logger.warn(`Unable to initialize Discord Rich Presence: ${error.message} ${error}`);
            }
        });
    }
}
exports.default = DiscordRPC;
DiscordRPC._logger = new LoggerUtil_1.default("DiscordRPC");
DiscordRPC.client = new discordRpc.Client({ transport: "ipc" });
//# sourceMappingURL=DiscordRPC.js.map