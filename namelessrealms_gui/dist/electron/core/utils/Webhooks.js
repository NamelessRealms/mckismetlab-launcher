"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = require("fs-extra");
const FormData = require("form-data");
const got_1 = require("got");
const LoggerUtil_1 = require("./LoggerUtil");
const Configs_1 = require("../../config/Configs");
class Webhooks {
    constructor() {
        this._logger = new LoggerUtil_1.default("Webhooks");
        this._webhooksErrorUrl = Configs_1.default.apiUrl + "/launcher/v2/webhooks/discord";
    }
    sendDiscordWebhookError(embeds) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield got_1.default.post(this._webhooksErrorUrl, {
                json: {
                    username: "Launcher Report Error",
                    embeds: [
                        {
                            title: embeds.title,
                            description: embeds.description,
                            author: {
                                name: embeds.authorName,
                                url: "",
                                icon_url: embeds.authorIconUrl,
                            },
                            color: embeds.color,
                            footer: {
                                text: embeds.footerText,
                                icon_url: "",
                                proxy_icon_url: ""
                            },
                            fields: embeds.getFields()
                        }
                    ]
                }
            });
        });
    }
    sendDiscordWebhookEmbedsFile(embeds, errorId, filePaths) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const form = new FormData();
            for (let i = 0; i < filePaths.length; i++) {
                form.append(`file${i + 1}`, fs.createReadStream(filePaths[i]));
            }
            form.append("payload_json", JSON.stringify({
                username: `Launcher Report Error - ${errorId}`,
                embeds: [
                    {
                        title: embeds.title,
                        description: embeds.description,
                        author: {
                            name: embeds.authorName,
                            url: "",
                            icon_url: embeds.authorIconUrl,
                        },
                        color: embeds.color,
                        footer: {
                            text: embeds.footerText,
                            icon_url: "",
                            proxy_icon_url: ""
                        },
                        fields: embeds.getFields()
                    }
                ]
            }));
            form.submit(this._webhooksErrorUrl, (error) => {
                if (error)
                    this._logger.error(error);
            });
        });
    }
    sendDiscordWebhookFile(filePath, id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const form = new FormData();
            form.append("username", "Launcher Report Error");
            if (id !== undefined)
                form.append("content", id);
            form.append("file", fs.createReadStream(filePath));
            form.submit(this._webhooksErrorUrl, (error) => {
                if (error)
                    this._logger.error(error);
            });
        });
    }
}
exports.default = Webhooks;
//# sourceMappingURL=Webhooks.js.map