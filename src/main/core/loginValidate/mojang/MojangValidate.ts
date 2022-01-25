import MojangAuthApi from "./MojangAuthApi";
import log from "electron-log";
import IoFile from "../../io/IoFile";

export default class MojangValidate {

    private _mojangAuthApi: MojangAuthApi;
    private _ioFile: IoFile;
    constructor(ioFile: IoFile) {
        this._mojangAuthApi = new MojangAuthApi();
        this._ioFile = ioFile;
    }
    
    public mojangLogin(account: string, password: string, rememberStatus: boolean): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {

                const profiles = await this._mojangAuthApi.accountAuth(account, password, this._ioFile.getClientToken());

                if (profiles === null) return reject("failure");

                this._ioFile.setAuthType("mojang");
                this._ioFile.setAccessToken(profiles.data.accessToken);
                this._ioFile.setClientToken(profiles.clientToken);
                this._ioFile.setUserUsername(profiles.data.user.username);
                this._ioFile.setUserId(profiles.data.user.id);
                this._ioFile.setPlayerName(profiles.data.selectedProfile.name);
                this._ioFile.setPlayerUuid(profiles.data.selectedProfile.id);
                this._ioFile.setRememberStatus(rememberStatus);

                this._ioFile.save();

                log.info("%c[Mojang] 帳號驗證成功!", "color: yellow");
                return resolve("success");

            } catch (error: any) {

                log.info("%c[Mojang] 帳號驗證失敗!", "color: yellow");

                switch (error.error) {
                    case "NullPointerException":
                        log.warn(error.errorMessage);
                        return reject("Mojang 帳號密碼不能空白");
                    case "ForbiddenOperationException":
                        log.warn(error.errorMessage)
                        return reject("Mojang 帳號密碼錯誤");
                    default:
                        log.error(error);
                        return reject(error);
                }
            }
        })
    }

    public async mojangTokenValidate(accessToken: string, clientToken: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {

            if (await this._mojangAuthApi.validate(accessToken, clientToken)) {
                log.info("%c[Mojang] 帳號驗證成功!", "color: yellow");
                return resolve(true);
            } else {
                log.warn("%c[Mojang] 帳號驗證失敗，嘗試取得新的 Token !", "color: yellow");
                if (await this.mojangTokenRefresh(accessToken, clientToken)) {
                    log.info("%c[Mojang] 嘗試取得新的 Token，帳號驗證成功!", "color: yellow");
                    return resolve(true);
                } else {
                    log.warn("%c[Mojang] 嘗試取得新的 Token ! 失敗!", "color: yellow");
                    return resolve(false);
                }
            }

        })
    }

    public mojangTokenRefresh(accessToken: string, clientToken: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {

                const refreshProfiles = await this._mojangAuthApi.refresh(accessToken, clientToken);

                if (refreshProfiles === null) return Promise.resolve(false);

                this._ioFile.setAuthType("mojang");
                this._ioFile.setAccessToken(refreshProfiles.accessToken);
                this._ioFile.setClientToken(refreshProfiles.clientToken);
                this._ioFile.setPlayerName(refreshProfiles.selectedProfile.name);
                this._ioFile.setPlayerUuid(refreshProfiles.selectedProfile.id);

                this._ioFile.save();

                return resolve(true);

            } catch (error: any) {

                log.warn(error.errorMessage);
                return resolve(false);

            }
        });
    }

    public signOut(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {

                await this._mojangAuthApi.invalidate(this._ioFile.getAccessToken(), this._ioFile.getClientToken());

                this._ioFile.setAccessToken("");
                this._ioFile.setClientToken("");
                this._ioFile.setUserUsername("");
                this._ioFile.setUserId("");
                this._ioFile.setPlayerName("");
                this._ioFile.setPlayerUuid("");
                this._ioFile.setRememberStatus(true);
                this._ioFile.save();

                return resolve();

            } catch (error: any) {
                return reject(error);
            }
        });
    }
}