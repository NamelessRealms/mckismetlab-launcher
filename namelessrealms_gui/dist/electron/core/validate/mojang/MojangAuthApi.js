"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const uuid = require("uuid");
const MojangApi_1 = require("../../../api/MojangApi");
class MojangAuthApi {
    constructor() {
        this._mojangApi = new MojangApi_1.default();
    }
    accountAuth(account, password, clientToken) {
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (account.length === 0 || password.length === 0) {
                return reject({ error: "NullPointerException", errorMessage: "account and password not null." });
            }
            if (clientToken.length === 0) {
                clientToken = uuid.v4();
            }
            try {
                const response = yield this._mojangApi.authenticate(account, password, clientToken);
                if (response.statusCode === 200) {
                    return resolve({
                        data: JSON.parse(response.body),
                        clientToken: clientToken
                    });
                }
                return reject(null);
            }
            catch (error) {
                if (error.response.status === 403 && error.response.data.error === "ForbiddenOperationException") {
                    return reject({ error: error.response.data.error, errorMessage: "Invalid credentials. Invalid username or password." });
                }
                return reject(error.response);
            }
        }));
    }
    validate(accessToken, clientToken) {
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this._mojangApi.validate(accessToken, clientToken);
                if (response.statusCode === 204) {
                    return resolve(true);
                }
                return resolve(false);
            }
            catch (error) {
                return resolve(false);
            }
        }));
    }
    refresh(accessToken, clientToken) {
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this._mojangApi.refresh(accessToken, clientToken);
                if (response.status === 200) {
                    return resolve(JSON.parse(response.body));
                }
                return reject(null);
            }
            catch (error) {
                const bodyJsonObject = JSON.parse(error.response.body);
                if (error.response.status === 403 && bodyJsonObject.error === "ForbiddenOperationException") {
                    return reject({ error: bodyJsonObject.error, errorMessage: bodyJsonObject.errorMessage });
                }
                return reject(error.response);
            }
        }));
    }
    invalidate(accessToken, clientToken) {
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                yield this._mojangApi.invalidate(accessToken, clientToken);
                return resolve();
            }
            catch (error) {
                return reject(error);
            }
        }));
    }
}
exports.default = MojangAuthApi;
//# sourceMappingURL=MojangAuthApi.js.map