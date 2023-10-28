"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const got_1 = require("got");
class FabricAssetsApi {
    static getFabricLoaderJson(mojangVersion, modLoaderVersion) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const resources = yield got_1.default.get(`${this._fabricJSONUrl}/${mojangVersion}/${modLoaderVersion}/profile/json`, {
                responseType: "json"
            });
            if (resources.statusCode !== 200) {
                return null;
            }
            return resources.body;
        });
    }
}
exports.default = FabricAssetsApi;
FabricAssetsApi._fabricJSONUrl = "https://meta.fabricmc.net/v2/versions/loader";
//# sourceMappingURL=FabricAssetsApi.js.map