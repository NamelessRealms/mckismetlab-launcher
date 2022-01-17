import log from "electron-log";
import IoFile from "../../io/IoFile";
import MicrosoftAuthApi from "../../api/MicrosoftAuthApi";

export default class MicrosoftValidate {

    public static MCAccessToken = "";

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
                const MCAccessToken = await this._microsoftAuthApi.authMinecraft(accessToken.access_token);
                const minecraftBuy = await this._microsoftAuthApi.checkMCStore(MCAccessToken.access_token);

                if (!minecraftBuy) {
                    return reject("You didn\'t buy Minecraft! Please use another Microsoft account or buy Minecraft.");
                }

                MicrosoftValidate.MCAccessToken = MCAccessToken.access_token;

                const MCProfile = await this._microsoftAuthApi.getMCProfile(MCAccessToken.access_token);

                this._ioFile.setAuthType("microsoft");
                this._ioFile.setMicrosoftAccessToken(accessToken.access_token);
                this._ioFile.setMicrosoftRefreshToken(accessToken.refresh_token);
                this._ioFile.setMicrosoftExpiresAt(accessToken.expires_at);
                this._ioFile.setPlayerName(MCProfile.name);
                this._ioFile.setPlayerUuid(MCProfile.id);
                this._ioFile.setRememberStatus(rememberStatus);

                this._ioFile.save();
                log.info("%c[Microsoft] 帳號驗證成功!", "color: yellow");
                resolve();
            } catch (error: any) {
                log.info("%c[Microsoft] 帳號驗證失敗!", "color: yellow");
                reject(error);
            }
        });
    }

    public validateMicrosoft(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {

                const expiresAt = this._ioFile.getMicrosoftExpiresAt();
                const MCExpiresAt = Date.parse(expiresAt.expiresAt);
                const now = new Date().getTime();
                const MCExpired = now > MCExpiresAt;

                if (MCExpired) {

                    log.warn("%c[Microsoft] 帳號過期，嘗試取得新的 Token !", "color: yellow");

                    const newAccessToken = await this._microsoftAuthApi.refreshAccessToken(this._ioFile.getMicrosoftRefreshToken());
                    const newMCAccessToken = await this._microsoftAuthApi.authMinecraft(newAccessToken.access_token);

                    this._ioFile.setAuthType("microsoft");
                    this._ioFile.setMicrosoftAccessToken(newMCAccessToken.access_token);
                    this._ioFile.setMicrosoftExpiresAt(newMCAccessToken.expires_at);

                    log.info("%c[Microsoft] 嘗試取得新的 Token，帳號驗證成功!", "color: yellow");

                    this._ioFile.save();
                    return resolve(true);
                } else {
                    log.info("%c[Microsoft] 帳號驗證成功!", "color: yellow");
                    return resolve(true);
                }
            } catch (error: any) {
                log.warn("%c[Microsoft] 嘗試取得新的 Token ! 失敗!", "color: yellow");
                reject(error);
            }
        });
    }

    public signOut(): Promise<void> {
        return new Promise<void>((resolve) => {

            this._ioFile.setMicrosoftAccessToken("");
            this._ioFile.setMicrosoftRefreshToken("");
            this._ioFile.setMicrosoftExpiresAt("");
            this._ioFile.setPlayerName("");
            this._ioFile.setPlayerUuid("");
            this._ioFile.setRememberStatus(true);
            this._ioFile.save();

            return resolve();
        });
    }
}