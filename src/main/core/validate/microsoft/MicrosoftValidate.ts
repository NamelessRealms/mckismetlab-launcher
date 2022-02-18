import IoFile from "../../io/IoFile";
import MicrosoftAuthApi, { MinecraftAuthResponse } from "../../../api/MicrosoftAuthApi";
import LoggerUtil from "../../utils/LoggerUtil";

export default class MicrosoftValidate {

    private _logger: LoggerUtil = new LoggerUtil("MicrosoftValidate");
    private _microsoftAuthApi: MicrosoftAuthApi;
    private _ioFile: IoFile;
    constructor(ioFile: IoFile) {
        this._microsoftAuthApi = new MicrosoftAuthApi();
        this._ioFile = ioFile;
    }

    public microsoftLogin(authCode: string, rememberStatus: boolean): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {

                const accessToken = await this._microsoftAuthApi.getAccessToken(authCode);
                const MCAccessToken = await this._authMinecraft(accessToken.access_token);
                const minecraftBuy = await this._microsoftAuthApi.checkMCStore(MCAccessToken.access_token);

                if (!minecraftBuy) {
                    return reject("You didn\'t buy Minecraft! Please use another Microsoft account or buy Minecraft.");
                }

                const MCProfile = await this._microsoftAuthApi.getMCProfile(MCAccessToken.access_token);
                const expiresAt = new Date();
                console.log(`microsoftLogin: ${expiresAt}`);
                expiresAt.setSeconds(expiresAt.getSeconds() + accessToken.expires_in);

                console.log(`microsoftLogin: ${expiresAt} ${expiresAt.getSeconds()} ${accessToken.expires_in}`);

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
            } catch (error: any) {
                this._logger.info("[Microsoft] 帳號驗證失敗!");
                reject(error);
            }
        });
    }

    private async _authMinecraft(accessToken: string): Promise<MinecraftAuthResponse> {

        const XBLToken = await this._microsoftAuthApi.getXBLToken(accessToken);
        const XSTSToken = await this._microsoftAuthApi.getXSTSToken(XBLToken.Token);
        const MCToken = await this._microsoftAuthApi.getMCAccessToken(XBLToken.DisplayClaims.xui[0].uhs, XSTSToken.Token);

        return MCToken;
    }

    public validateMicrosoft(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {

                const expiresAt = this._ioFile.getMicrosoftExpiresAt();
                const MCExpiresAt = Date.parse(expiresAt);
                const now = new Date().getTime();
                const MCExpired = now > MCExpiresAt;

                if (MCExpired) {

                    this._logger.warn("[Microsoft] 帳號過期，嘗試取得新的 Token !");

                    const refreshToken = await this._ioFile.getMicrosoftRefreshToken();

                    if(refreshToken === null) {
                        return resolve(false);
                    }

                    const newAccessToken = await this._microsoftAuthApi.refreshAccessToken(refreshToken);
                    const newMCAccessToken = await this._authMinecraft(newAccessToken.access_token);

                    const expiresAt = new Date();
                    expiresAt.setSeconds(expiresAt.getSeconds() + newMCAccessToken.expires_in);

                    this._ioFile.setAuthType("microsoft");
                    this._ioFile.setMicrosoftAccessToken(newMCAccessToken.access_token);
                    this._ioFile.setMicrosoftExpiresAt(newMCAccessToken.expires_in);

                    this._logger.info("[Microsoft] 嘗試取得新的 Token，帳號驗證成功!");

                    this._ioFile.save();
                    return resolve(true);
                } else {
                    this._logger.info("[Microsoft] 帳號驗證成功!");
                    return resolve(true);
                }
            } catch (error: any) {
                this._logger.warn("[Microsoft] 嘗試取得新的 Token ! 失敗!");
                reject(error);
            }
        });
    }

    public signOut(): Promise<void> {
        return new Promise<void>((resolve) => {

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