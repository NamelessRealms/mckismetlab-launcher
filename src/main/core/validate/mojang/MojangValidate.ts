import MojangAuthApi from "./MojangAuthApi";
import LauncherStore from "../../io/LauncherStore";
import LoggerUtil from "../../utils/LoggerUtil";

export default class MojangValidate {

    private _logger: LoggerUtil = new LoggerUtil("MojangValidate");
    private _mojangAuthApi: MojangAuthApi;
    private _ioFile: LauncherStore;
    constructor(ioFile: LauncherStore) {
        this._mojangAuthApi = new MojangAuthApi();
        this._ioFile = ioFile;
    }
    
    public mojangLogin(account: string, password: string, rememberStatus: boolean): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {

                const profiles = await this._mojangAuthApi.accountAuth(account, password, this._ioFile.getMinecraftClientToken());

                if (profiles === null) return reject("failure");

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

            } catch (error: any) {

                this._logger.info("[Mojang] 帳號驗證失敗!");

                switch (error.error) {
                    case "NullPointerException":
                        this._logger.warn(error.errorMessage);
                        return reject("Mojang 帳號密碼不能空白");
                    case "ForbiddenOperationException":
                        this._logger.warn(error.errorMessage)
                        return reject("Mojang 帳號密碼錯誤");
                    default:
                        this._logger.error(error);
                        return reject(error);
                }
            }
        })
    }

    public async mojangTokenValidate(accessToken: string, clientToken: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {

            if (await this._mojangAuthApi.validate(accessToken, clientToken)) {
                this._logger.info("[Mojang] 帳號驗證成功!");
                return resolve(true);
            } else {
                this._logger.warn("[Mojang] 帳號驗證失敗，嘗試取得新的 Token !");
                if (await this.mojangTokenRefresh(accessToken, clientToken)) {
                    this._logger.info("[Mojang] 嘗試取得新的 Token，帳號驗證成功!");
                    return resolve(true);
                } else {
                    this._logger.warn("[Mojang] 嘗試取得新的 Token ! 失敗!");
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
                this._ioFile.setMinecraftAccessToken(refreshProfiles.accessToken);
                this._ioFile.setMinecraftClientToken(refreshProfiles.clientToken);
                this._ioFile.setPlayerName(refreshProfiles.selectedProfile.name);
                this._ioFile.setPlayerUuid(refreshProfiles.selectedProfile.id);

                this._ioFile.save();

                return resolve(true);

            } catch (error: any) {

                this._logger.warn(error.errorMessage);
                return resolve(false);

            }
        });
    }

    public signOut(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {

                await this._mojangAuthApi.invalidate(this._ioFile.getMinecraftAccessToken(), this._ioFile.getMinecraftClientToken());

                this._ioFile.setMinecraftAccessToken("");
                this._ioFile.setMinecraftClientToken("");
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