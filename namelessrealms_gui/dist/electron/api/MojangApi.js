"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const got_1 = require("got");
class MojangApi {
    constructor() {
        this._authUrl = "https://authserver.mojang.com";
        this._profileUrl = "https://sessionserver.mojang.com/session/minecraft/profile";
    }
    authenticate(account, password, clientToken) {
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                // const response = await axios.post(this._authUrl + "/authenticate", {
                //     agent: {
                //         name: "Minecraft",
                //         version: 1
                //     },
                //     username: account,
                //     password: password,
                //     clientToken: clientToken,
                //     requestUser: true
                // });
                const response = yield got_1.default.post(this._authUrl + "/authenticate", {
                    json: {
                        agent: {
                            name: "Minecraft",
                            version: 1
                        },
                        username: account,
                        password: password,
                        clientToken: clientToken,
                        requestUser: true
                    }
                });
                return resolve(response);
            }
            catch (error) {
                return reject(error);
            }
        }));
    }
    validate(accessToken, clientToken) {
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                // const response = await axios.post(this._authUrl + "/validate", {
                //     accessToken: accessToken,
                //     clientToken: clientToken
                // });
                const response = yield got_1.default.post(this._authUrl + "/validate", {
                    json: {
                        accessToken: accessToken,
                        clientToken: clientToken
                    }
                });
                return resolve(response);
            }
            catch (error) {
                return reject(error);
            }
        }));
    }
    refresh(accessToken, clientToken) {
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                // const response = await axios.post(this._authUrl + "/refresh", {
                //     accessToken: accessToken,
                //     clientToken: clientToken
                // });
                const response = yield got_1.default.post(this._authUrl + "/refresh", {
                    json: {
                        accessToken: accessToken,
                        clientToken: clientToken
                    }
                });
                return resolve(response);
            }
            catch (error) {
                return reject(error);
            }
        }));
    }
    invalidate(accessToken, clientToken) {
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                // const response = await axios.post(this._authUrl + "/invalidate", {
                //     accessToken: accessToken,
                //     clientToken: clientToken
                // });
                const response = yield got_1.default.post(this._authUrl + "/invalidate", {
                    json: {
                        accessToken: accessToken,
                        clientToken: clientToken
                    }
                });
                if (response.statusCode === 204 || response.statusCode === 403) {
                    return resolve();
                }
                else {
                    return reject();
                }
            }
            catch (error) {
                reject(error);
            }
        }));
    }
    profile(uuid) {
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                // const response = await axios.get(this._profileUrl + `/${uuid}`);
                const response = yield got_1.default.get(this._profileUrl + `/${uuid}`);
                if (response.statusCode === 200) {
                    return resolve(response);
                }
                else {
                    return reject(response);
                }
            }
            catch (error) {
                return reject(error);
            }
        }));
    }
}
exports.default = MojangApi;
//# sourceMappingURL=MojangApi.js.map