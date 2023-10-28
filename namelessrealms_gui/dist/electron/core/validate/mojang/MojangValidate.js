"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const MojangAuthApi_1 = require("./MojangAuthApi");
const LoggerUtil_1 = require("../../utils/LoggerUtil");
class MojangValidate {
    constructor(ioFile) {
        this._logger = new LoggerUtil_1.default("MojangValidate");
        this._mojangAuthApi = new MojangAuthApi_1.default();
        this._ioFile = ioFile;
    }
    mojangLogin(account, password, rememberStatus) {
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const profiles = yield this._mojangAuthApi.accountAuth(account, password, this._ioFile.getMinecraftClientToken());
                if (profiles === null)
                    return reject("failure");
                this._ioFile.setAuthType("mojang");
                this._ioFile.setMinecraftAccessToken(profiles.data.accessToken);
                this._ioFile.setMinecraftClientToken(profiles.clientToken);
                this._ioFile.setUserUsername(profiles.data.user.username);
                this._ioFile.setUserId(profiles.data.user.id);
                this._ioFile.setPlayerName(profiles.data.selectedProfile.name);
                this._ioFile.setPlayerUuid(profiles.data.selectedProfile.id);
                this._ioFile.setRememberStatus(rememberStatus);
                this._ioFile.save();
                this._logger.info("[Mojang] 帳號驗證成功!");
                return resolve("success");
            }
            catch (error) {
                this._logger.info("[Mojang] 帳號驗證失敗!");
                switch (error.error) {
                    case "NullPointerException":
                        this._logger.warn(error.errorMessage);
                        return reject("Mojang 帳號密碼不能空白");
                    case "ForbiddenOperationException":
                        this._logger.warn(error.errorMessage);
                        return reject("Mojang 帳號密碼錯誤");
                    default:
                        this._logger.error(error);
                        return reject(error);
                }
            }
        }));
    }
    mojangTokenValidate(accessToken, clientToken) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                if (yield this._mojangAuthApi.validate(accessToken, clientToken)) {
                    this._logger.info("[Mojang] 帳號驗證成功!");
                    return resolve(true);
                }
                else {
                    this._logger.warn("[Mojang] 帳號驗證失敗，嘗試取得新的 Token !");
                    if (yield this.mojangTokenRefresh(accessToken, clientToken)) {
                        this._logger.info("[Mojang] 嘗試取得新的 Token，帳號驗證成功!");
                        return resolve(true);
                    }
                    else {
                        this._logger.warn("[Mojang] 嘗試取得新的 Token ! 失敗!");
                        return resolve(false);
                    }
                }
            }));
        });
    }
    mojangTokenRefresh(accessToken, clientToken) {
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const refreshProfiles = yield this._mojangAuthApi.refresh(accessToken, clientToken);
                if (refreshProfiles === null)
                    return Promise.resolve(false);
                this._ioFile.setAuthType("mojang");
                this._ioFile.setMinecraftAccessToken(refreshProfiles.accessToken);
                this._ioFile.setMinecraftClientToken(refreshProfiles.clientToken);
                this._ioFile.setPlayerName(refreshProfiles.selectedProfile.name);
                this._ioFile.setPlayerUuid(refreshProfiles.selectedProfile.id);
                this._ioFile.save();
                return resolve(true);
            }
            catch (error) {
                this._logger.warn(error.errorMessage);
                return resolve(false);
            }
        }));
    }
    signOut() {
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                yield this._mojangAuthApi.invalidate(this._ioFile.getMinecraftAccessToken(), this._ioFile.getMinecraftClientToken());
                this._ioFile.setMinecraftAccessToken("");
                this._ioFile.setMinecraftClientToken("");
                this._ioFile.setUserUsername("");
                this._ioFile.setUserId("");
                this._ioFile.setPlayerName("");
                this._ioFile.setPlayerUuid("");
                this._ioFile.setRememberStatus(true);
                this._ioFile.save();
                return resolve();
            }
            catch (error) {
                return reject(error);
            }
        }));
    }
}
exports.default = MojangValidate;
//# sourceMappingURL=MojangValidate.js.map