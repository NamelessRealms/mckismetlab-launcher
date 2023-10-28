"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const got_1 = require("got");
class MicrosoftAuthApi {
    constructor() {
        this._clientId = "11f704b3-0581-4011-a35d-360c13be5bbe";
        this._tokenUri = "https://login.live.com/oauth20_token.srf";
        this._authXBLUri = "https://user.auth.xboxlive.com/user/authenticate";
        this._authXSTSUri = "https://xsts.auth.xboxlive.com/xsts/authorize";
        this._authMCUri = "https://api.minecraftservices.com/authentication/login_with_xbox";
        this._checkMCStoreUrl = "https://api.minecraftservices.com/entitlements/mcstore";
        this._getMCProfileUrl = "https://api.minecraftservices.com/minecraft/profile";
        this._STANDARD_HEADERS = {
            "Content-Type": "application/json",
            Accept: "application/json"
        };
    }
    getAccessToken(authCode) {
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const microsoftAuthRes = yield got_1.default.post(this._tokenUri, {
                    form: {
                        client_id: this._clientId,
                        code: authCode,
                        grant_type: "authorization_code",
                        redirect_uri: "https://login.microsoftonline.com/common/oauth2/nativeclient",
                    },
                    responseType: "json"
                });
                return resolve(microsoftAuthRes.body);
            }
            catch (error) {
                reject(error);
            }
        }));
    }
    refreshAccessToken(refreshToken) {
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const microsoftRefreshAccessRes = yield got_1.default.post(this._tokenUri, {
                    form: {
                        client_id: this._clientId,
                        refresh_token: refreshToken,
                        scope: "XboxLive.signin",
                        redirect_uri: "https://login.microsoftonline.com/common/oauth2/nativeclient",
                        grant_type: "refresh_token"
                    },
                    responseType: "json"
                });
                return resolve(microsoftRefreshAccessRes.body);
            }
            catch (error) {
                reject(error);
            }
        }));
    }
    checkMCStore(accessToken) {
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const checkGameOwnershipRes = yield got_1.default.get(this._checkMCStoreUrl, {
                    headers: {
                        Authorization: "Bearer " + accessToken
                    },
                    responseType: "json"
                });
                if (checkGameOwnershipRes.body.items && checkGameOwnershipRes.body.items.length > 0) {
                    return resolve(true);
                }
                else {
                    return resolve(false);
                }
            }
            catch (error) {
                reject(false);
            }
        }));
    }
    getMCProfile(accessToken) {
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const getProfileRes = yield got_1.default.get(this._getMCProfileUrl, {
                    headers: {
                        Authorization: "Bearer " + accessToken
                    },
                    responseType: "json"
                });
                return resolve(getProfileRes.body);
            }
            catch (error) {
                reject(error);
            }
        }));
    }
    getXBLToken(accessToken) {
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const XBLAuthRes = yield got_1.default.post(this._authXBLUri, {
                    json: {
                        RelyingParty: "http://auth.xboxlive.com",
                        TokenType: "JWT",
                        Properties: {
                            AuthMethod: "RPS",
                            SiteName: "user.auth.xboxlive.com",
                            RpsTicket: `d=${accessToken}`
                        }
                    },
                    headers: this._STANDARD_HEADERS,
                    responseType: "json"
                });
                return resolve(XBLAuthRes.body);
            }
            catch (error) {
                reject(error);
            }
        }));
    }
    getXSTSToken(XBLToken) {
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const XSTSAuthRes = yield got_1.default.post(this._authXSTSUri, {
                    json: {
                        RelyingParty: "rp://api.minecraftservices.com/",
                        TokenType: "JWT",
                        Properties: {
                            SandboxId: "RETAIL",
                            UserTokens: [XBLToken]
                        }
                    },
                    headers: this._STANDARD_HEADERS,
                    responseType: "json"
                });
                if (XSTSAuthRes.body.XErr !== undefined) {
                    switch (XSTSAuthRes.body.XErr) {
                        case 2148916233:
                            return reject("Your Microsoft account is not connected to an Xbox account. Please create one.");
                        case 2148916238:
                            return reject("Since you are not yet 18 years old, an adult must add you to a family in order for you to use NexusLauncher!");
                        default:
                            return reject(XSTSAuthRes.body);
                    }
                }
                return resolve(XSTSAuthRes.body);
            }
            catch (error) {
                reject(error);
            }
        }));
    }
    getMCAccessToken(UHS, XSTSToken) {
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const minecraftAuthRes = yield got_1.default.post(this._authMCUri, {
                    json: {
                        identityToken: `XBL3.0 x=${UHS};${XSTSToken}`
                    },
                    headers: this._STANDARD_HEADERS,
                    responseType: "json"
                });
                return resolve(minecraftAuthRes.body);
            }
            catch (error) {
                reject(error);
            }
        }));
    }
}
exports.default = MicrosoftAuthApi;
//# sourceMappingURL=MicrosoftAuthApi.js.map