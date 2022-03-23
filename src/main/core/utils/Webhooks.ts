import * as fs from "fs-extra";
import * as FormData from "form-data";

import got from "got";

import LoggerUtil from "./LoggerUtil";
import Config from "../../config/Configs";

export default class Webhooks {

    private _logger = new LoggerUtil("Webhooks");

    public async sendDiscordWebhookError(embeds: any): Promise<void> {

        await got.post(Config.webhooksErrorUrl, {
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
    }

    public async sendDiscordWebhookEmbedsFile(embeds: any, errorId: string, filePaths: Array<string>): Promise<void> {

        const form = new FormData();

        for(let i = 0; i < filePaths.length; i++) {
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

        form.submit(Config.webhooksErrorUrl, (error) => {
            if(error) this._logger.error(error);
        });
    }

    public async sendDiscordWebhookFile(filePath: string, id?: string): Promise<void> {
        const form = new FormData();
        form.append("username", "Launcher Report Error");
        if(id !== undefined) form.append("content", id);
        form.append("file", fs.createReadStream(filePath));
        form.submit(Config.webhooksErrorUrl, (error) => {
            if(error) this._logger.error(error);
        });
    }
}