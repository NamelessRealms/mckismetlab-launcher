"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const LoggerUtil_1 = require("../core/utils/LoggerUtil");
const got_1 = require("got");
class MojangAssetsService {
    static getVersionManifest() {
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                this._logger.info(`請求 GET ${this.versionManifestUrl}`);
                const response = yield got_1.default.get(this.versionManifestUrl);
                if (response.statusCode !== 200) {
                    this._logger.error(`請求失敗 GET ${this.versionManifestUrl}`);
                    return reject(response.body);
                }
                this._logger.info(`成功請求 GET ${this.versionManifestUrl}`);
                return resolve(JSON.parse(response.body));
            }
            catch (error) {
                return reject(error);
            }
        }));
    }
}
exports.default = MojangAssetsService;
MojangAssetsService._logger = new LoggerUtil_1.default("MojangAssetsService");
MojangAssetsService.versionManifestUrl = "https://launchermeta.mojang.com/mc/game/version_manifest.json";
//# sourceMappingURL=MojangAssetsService.js.map