"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const MicrosoftAuthApi_1 = require("../../../api/MicrosoftAuthApi");
const LoggerUtil_1 = require("../../utils/LoggerUtil");
class MicrosoftValidate {
    constructor(ioFile) {
        this._logger = new LoggerUtil_1.default("MicrosoftValidate");
        this._microsoftAuthApi = new MicrosoftAuthApi_1.default();
        this._ioFile = ioFile;
    }
    microsoftLogin(authCode, rememberStatus) {
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const accessToken = yield this._microsoftAuthApi.getAccessToken(authCode);
                const MCAccessToken = yield this._authMinecraft(accessToken.access_token);
                const minecraftBuy = yield this._microsoftAuthApi.checkMCStore(MCAccessToken.access_token);
                if (!minecraftBuy) {
                    return reject("You didn\'t buy Minecraft! Please use another Microsoft account or buy Minecraft.");
                }
                const MCProfile = yield this._microsoftAuthApi.getMCProfile(MCAccessToken.access_token);
                const expiresAt = new Date();
                // console.log(`microsoftLogin: ${expiresAt}`);
                expiresAt.setSeconds(expiresAt.getSeconds() + accessToken.expires_in);
                // console.log(`microsoftLogin: ${expiresAt} ${expiresAt.getSeconds()} ${accessToken.expires_in}`);
                this._ioFile.setAuthType("microsoft");
                this._ioFile.setMicrosoftAccessToken(accessToken.access_token);
                this._ioFile.setMicrosoftRefreshToken(accessToken.refresh_token);
                this._ioFile.setMicrosoftExpiresAt(expiresAt);
                this._ioFile.setMicrosoftMcAccountToken(MCAccessToken.access_token);
                this._ioFile.setPlayerName(MCProfile.name);
                this._ioFile.setPlayerUuid(MCProfile.id);
                this._ioFile.setRememberStatus(rememberStatus);
                this._ioFile.save();
                this._logger.info("[Microsoft] 帳號驗證成功!");
                resolve();
            }
            catch (error) {
                this._logger.info("[Microsoft] 帳號驗證失敗!");
                reject(error);
            }
        }));
    }
    _authMinecraft(accessToken) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const XBLToken = yield this._microsoftAuthApi.getXBLToken(accessToken);
            const XSTSToken = yield this._microsoftAuthApi.getXSTSToken(XBLToken.Token);
            const MCToken = yield this._microsoftAuthApi.getMCAccessToken(XBLToken.DisplayClaims.xui[0].uhs, XSTSToken.Token);
            return MCToken;
        });
    }
    validateMicrosoft() {
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const expiresAt = this._ioFile.getMicrosoftExpiresAt();
                const MCExpiresAt = Date.parse(expiresAt);
                const now = new Date().getTime();
                const MCExpired = now > MCExpiresAt;
                if (MCExpired) {
                    this._logger.warn("[Microsoft] 帳號過期，嘗試取得新的 Token !");
                    const refreshToken = yield this._ioFile.getMicrosoftRefreshToken();
                    if (refreshToken === null) {
                        return resolve(false);
                    }
                    const newAccessToken = yield this._microsoftAuthApi.refreshAccessToken(refreshToken);
                    const newMCAccessToken = yield this._authMinecraft(newAccessToken.access_token);
                    const expiresAt = new Date();
                    expiresAt.setSeconds(expiresAt.getSeconds() + newMCAccessToken.expires_in);
                    this._ioFile.setAuthType("microsoft");
                    this._ioFile.setMicrosoftAccessToken(newAccessToken.access_token);
                    this._ioFile.setMicrosoftExpiresAt(expiresAt);
                    this._ioFile.setMicrosoftMcAccountToken(newMCAccessToken.access_token);
                    this._logger.info("[Microsoft] 嘗試取得新的 Token，帳號驗證成功!");
                    this._ioFile.save();
                    return resolve(true);
                }
                else {
                    this._logger.info("[Microsoft] 帳號驗證成功!");
                    return resolve(true);
                }
            }
            catch (error) {
                this._logger.warn("[Microsoft] 嘗試取得新的 Token ! 失敗!");
                reject(error);
            }
        }));
    }
    signOut() {
        return new Promise((resolve) => {
            this._ioFile.setMicrosoftAccessToken("");
            this._ioFile.setMicrosoftRefreshToken("");
            this._ioFile.setMicrosoftExpiresAt("");
            this._ioFile.setMicrosoftMcAccountToken("");
            this._ioFile.setPlayerName("");
            this._ioFile.setPlayerUuid("");
            this._ioFile.setRememberStatus(true);
            this._ioFile.save();
            return resolve();
        });
    }
}
exports.default = MicrosoftValidate;
//# sourceMappingURL=MicrosoftValidate.js.map