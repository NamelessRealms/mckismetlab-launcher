"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Embed {
    constructor() {
        this._title = "";
        this._description = "";
        this._color = "";
        this._author = {
            name: "",
            icon_url: ""
        };
        this._footer = {
            text: "",
            icon_url: ""
        };
        this._fields = new Array();
    }
    setFields(fieldsData) {
        this._fields.push({
            name: fieldsData.name,
            value: fieldsData.value,
            inline: fieldsData.inline || true
        });
    }
    getFields() {
        return this._fields;
    }
    set title(title) {
        this._title = title;
    }
    get title() {
        return this._title;
    }
    set description(description) {
        this._description = description;
    }
    get description() {
        return this._description;
    }
    set color(color) {
        this._color = color;
    }
    get color() {
        return this._color;
    }
    set authorName(name) {
        this._author.name = name;
    }
    get authorName() {
        return this._author.name;
    }
    set authorIconUrl(url) {
        this._author.icon_url = url;
    }
    get authorIconUrl() {
        return this._author.icon_url;
    }
    set footerText(text) {
        this._footer.text = text;
    }
    get footerText() {
        return this._footer.text;
    }
    set footerIconUrl(url) {
        this._footer.icon_url = url;
    }
    get footerIconUrl() {
        return this._footer.icon_url;
    }
}
exports.default = Embed;
//# sourceMappingURL=Embed.js.map