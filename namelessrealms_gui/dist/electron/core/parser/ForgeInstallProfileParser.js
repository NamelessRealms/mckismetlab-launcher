"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ForgeInstallProfileParser {
    constructor(forgeInstallProfileJsonObjs) {
        this._forgeInstallProfileJsonObjs = forgeInstallProfileJsonObjs;
    }
    get librariesSavePath() {
        return this._forgeInstallProfileJsonObjs.path.replace(".", "\\").replace(new RegExp(":", "g"), "\\");
    }
    get data() {
        return this._forgeInstallProfileJsonObjs.data;
    }
    get libraries() {
        return this._forgeInstallProfileJsonObjs.libraries;
    }
    get processors() {
        return this._forgeInstallProfileJsonObjs.processors;
    }
}
exports.default = ForgeInstallProfileParser;
//# sourceMappingURL=ForgeInstallProfileParser.js.map