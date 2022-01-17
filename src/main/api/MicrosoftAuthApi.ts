import got from "got";

export default class MicrosoftAuthApi {

    private _clientId = "11f704b3-0581-4011-a35d-360c13be5bbe";

    private _tokenUri = "https://login.live.com/oauth20_token.srf";
    private _authXBLUri = "https://user.auth.xboxlive.com/user/authenticate";
    private _authXSTSUri = "https://xsts.auth.xboxlive.com/xsts/authorize";
    private _authMCUri = "https://api.minecraftservices.com/authentication/login_with_xbox";

    private _checkMCStoreUrl = "https://api.minecraftservices.com/entitlements/mcstore";
    private _getMCProfileUrl = "https://api.minecraftservices.com/minecraft/profile";

    public getAccessToken(authCode: string): Promise<{ expires_at: Date, access_token: string, refresh_token: string }> {
        return new Promise(async (resolve, reject) => {
            try {

                // const microsoftAuthRes = await axios({
                //     method: "POST",
                //     url: this._tokenUri,
                //     headers: {
                //         "Content-Type": "application/x-www-form-urlencoded"
                //     },
                //     data: new URLSearchParams({
                //         client_id: this._clientId,
                //         code: authCode,
                //         grant_type: "authorization_code",
                //         redirect_uri: "https://login.microsoftonline.com/common/oauth2/nativeclient",

                //     })
                // });

                const microsoftAuthRes = await got<any>({
                    method: "POST",
                    url: this._tokenUri,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    form: {
                        client_id: this._clientId,
                        code: authCode,
                        grant_type: "authorization_code",
                        redirect_uri: "https://login.microsoftonline.com/common/oauth2/nativeclient",
                    }
                });

                const bodyJsonObject = JSON.parse(microsoftAuthRes.body);

                const expiresAt = new Date();

                expiresAt.setSeconds(expiresAt.getSeconds() + bodyJsonObject.expires_in);

                return resolve({
                    expires_at: expiresAt,
                    access_token: bodyJsonObject.access_token,
                    refresh_token: bodyJsonObject.refresh_token
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    public refreshAccessToken(refreshToken: string): Promise<{ expires_at: Date, access_token: string }> {
        return new Promise(async (resolve, reject) => {
            try {

                // const microsoftRefreshAccessRes = await axios({
                //     method: "POST",
                //     url: this._tokenUri,
                //     headers: {
                //         "Content-Type": "application/x-www-form-urlencoded"
                //     },
                //     data: new URLSearchParams({
                //         client_id: this._clientId,
                //         refresh_token: refreshToken,
                //         scope: "XboxLive.signin",
                //         redirect_uri: "https://login.microsoftonline.com/common/oauth2/nativeclient",
                //         grant_type: "refresh_token"
                //     })
                // });

                const microsoftRefreshAccessRes = await got<any>({
                    method: "POST",
                    url: this._tokenUri,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    form: {
                        client_id: this._clientId,
                        refresh_token: refreshToken,
                        scope: "XboxLive.signin",
                        redirect_uri: "https://login.microsoftonline.com/common/oauth2/nativeclient",
                        grant_type: "refresh_token"
                    }
                })

                const expiresAt = new Date();

                const bodyJsonObject = JSON.parse(microsoftRefreshAccessRes.body);

                expiresAt.setSeconds(expiresAt.getSeconds() + bodyJsonObject.expires_in);

                return resolve({
                    expires_at: expiresAt,
                    access_token: bodyJsonObject.access_token
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    public authMinecraft(accessToken: string): Promise<{ access_token: string; expires_at: Date }> {
        return new Promise(async (resolve, reject) => {
            try {

                const XBLToken = await this._getXBLToken(accessToken);
                const XSTSToken = await this._getXSTSToken(XBLToken.token);
                const MCToken = await this._getMCAccessToken(XBLToken.uhs, XSTSToken);

                return resolve(MCToken);

            } catch (error) {
                reject(error);
            }
        });
    }

    public checkMCStore(accessToken: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {

                // const checkGameOwnershipRes = await axios({
                //     method: "GET",
                //     url: this._checkMCStoreUrl,
                //     headers: {
                //         Authorization: "Bearer " + accessToken
                //     }
                // });

                const checkGameOwnershipRes = await got<any>({
                    method: "GET",
                    url: this._checkMCStoreUrl,
                    headers: {
                        Authorization: "Bearer " + accessToken
                    }
                });

                const bodyJsonObject = JSON.parse(checkGameOwnershipRes.body);

                if (bodyJsonObject.items && bodyJsonObject.items.length > 0) {
                    return resolve(true);
                } else {
                    return resolve(false);
                }

            } catch (error) {
                reject(false);
            }
        });
    }

    public getMCProfile(accessToken: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {

                // const getProfileRes = await axios({
                //     method: "GET",
                //     url: this._getMCProfileUrl,
                //     headers: {
                //         Authorization: "Bearer " + accessToken
                //     }
                // });

                const getProfileRes = await got<any>({
                    method: "GET",
                    url: this._getMCProfileUrl,
                    headers: {
                        Authorization: "Bearer " + accessToken
                    }
                });

                const bodyJsonObject = JSON.parse(getProfileRes.body);

                return resolve(bodyJsonObject);

            } catch (error) {
                reject(error);
            }
        });
    }

    private _getXBLToken(accessToken: string): Promise<{ token: string, uhs: string }> {
        return new Promise(async (resolve, reject) => {
            try {

                // const XBLAuthRes = await axios({
                //     method: "POST",
                //     url: this._authXBLUri,
                //     headers: {
                //         "Content-Type": "application/json"
                //     },
                //     data: {
                //         RelyingParty: "http://auth.xboxlive.com",
                //         TokenType: "JWT",
                //         Properties: {
                //             AuthMethod: "RPS",
                //             SiteName: "user.auth.xboxlive.com",
                //             RpsTicket: `d=${accessToken}`
                //         }
                //     }
                // });

                const XBLAuthRes = await got<any>({
                    method: "POST",
                    url: this._authXBLUri,
                    headers: {
                        "Content-Type": "application/json"
                    },
                    json: {
                        RelyingParty: "http://auth.xboxlive.com",
                        TokenType: "JWT",
                        Properties: {
                            AuthMethod: "RPS",
                            SiteName: "user.auth.xboxlive.com",
                            RpsTicket: `d=${accessToken}`
                        }
                    }
                });

                const bodyJsonObject = JSON.parse(XBLAuthRes.body);

                return resolve({
                    token: bodyJsonObject.Token,
                    uhs: bodyJsonObject.DisplayClaims.xui[0].uhs
                });

            } catch (error: any) {
                reject(error);
            }
        });
    }

    private _getXSTSToken(XBLToken: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {

                // const XSTSAuthRes = await axios({
                //     method: "POST",
                //     url: this._authXSTSUri,
                //     headers: {
                //         "Content-Type": "application/json"
                //     },
                //     data: {
                //         RelyingParty: "rp://api.minecraftservices.com/",
                //         TokenType: "JWT",
                //         Properties: {
                //             SandboxId: "RETAIL",
                //             UserTokens: [XBLToken]
                //         }
                //     }
                // });

                const XSTSAuthRes = await got<any>({
                    method: "POST",
                    url: this._authXSTSUri,
                    headers: {
                        "Content-Type": "application/json"
                    },
                    json: {
                        RelyingParty: "rp://api.minecraftservices.com/",
                        TokenType: "JWT",
                        Properties: {
                            SandboxId: "RETAIL",
                            UserTokens: [XBLToken]
                        }
                    }
                });

                const bodyJsonObject = JSON.parse(XSTSAuthRes.body);

                if (bodyJsonObject.XErr) {

                    switch (bodyJsonObject.XErr) {
                        case 2148916233:
                            return reject("Your Microsoft account is not connected to an Xbox account. Please create one.");

                        case 2148916238:
                            return reject("Since you are not yet 18 years old, an adult must add you to a family in order for you to use NexusLauncher!");

                        default:
                            return reject(bodyJsonObject);
                    }
                }

                return resolve(bodyJsonObject.Token);

            } catch (error) {
                reject(error);
            }
        });
    }

    private _getMCAccessToken(UHS: string, XSTSToken: string): Promise<{ access_token: string; expires_at: Date }> {
        return new Promise(async (resolve, reject) => {
            try {

                // const minecraftAuthRes = await axios({
                //     method: "POST",
                //     url: this._authMCUri,
                //     headers: {
                //         "Content-Type": "application/json"
                //     },
                //     data: {
                //         identityToken: `XBL3.0 x=${UHS};${XSTSToken}`
                //     }
                // });

                const minecraftAuthRes = await got<any>({
                    method: "POST",
                    url: this._authMCUri,
                    headers: {
                        "Content-Type": "application/json"
                    },
                    json: {
                        identityToken: `XBL3.0 x=${UHS};${XSTSToken}`
                    }
                });

                const bodyJsonObject = JSON.parse(minecraftAuthRes.body);

                const expiresAt = new Date();

                expiresAt.setSeconds(expiresAt.getSeconds() + bodyJsonObject.expires_in);

                return resolve({
                    access_token: bodyJsonObject.access_token,
                    expires_at: expiresAt
                });

            } catch (error) {
                reject(error);
            }
        });
    }
}