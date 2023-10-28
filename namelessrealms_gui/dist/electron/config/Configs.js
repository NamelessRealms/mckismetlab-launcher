"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Config {
    static get discordRpcClientId() {
        return "932980068031012945";
    }
    static get assetsDownloadLimit() {
        return 5;
    }
    static get apiUrl() {
        return process.env.NODE_ENV !== "development" ? "https://namelessrealms.com/api" : `http://localhost:8030`;
    }
}
exports.default = Config;
//# sourceMappingURL=Configs.js.map