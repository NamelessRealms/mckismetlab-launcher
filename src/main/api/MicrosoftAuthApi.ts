import got from "got";

interface MicrosoftAuthResponse {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
    token_type: string;
    user_id: string;
}

interface RefreshAccessTokenResponse {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
    token_type: string;
    user_id: string;
}

interface XBLAuthResponse {
    DisplayClaims: {
        xui: Array<{
            uhs: string;
        }>
    };
    IssueInstant: string;
    NotAfter: string;
    Token: string;
}

interface XSTSAuthResponse {
    DisplayClaims: {
        xui: Array<{
            uhs: string;
        }>
    };
    IssueInstant: string;
    NotAfter: string;
    Token: string;
    XErr?: number;
}

export interface MinecraftAuthResponse {
    access_token: string;
    expires_in: number;
    roles: Array<string>;
    token_type: string;
    username: string;
}

export default class MicrosoftAuthApi {

    private readonly _clientId = "11f704b3-0581-4011-a35d-360c13be5bbe";

    private readonly _tokenUri = "https://login.live.com/oauth20_token.srf";
    private readonly _authXBLUri = "https://user.auth.xboxlive.com/user/authenticate";
    private readonly _authXSTSUri = "https://xsts.auth.xboxlive.com/xsts/authorize";
    private readonly _authMCUri = "https://api.minecraftservices.com/authentication/login_with_xbox";

    private readonly _checkMCStoreUrl = "https://api.minecraftservices.com/entitlements/mcstore";
    private readonly _getMCProfileUrl = "https://api.minecraftservices.com/minecraft/profile";

    private readonly _STANDARD_HEADERS = {
        "Content-Type": "application/json",
        Accept: "application/json"
    }

    public getAccessToken(authCode: string): Promise<MicrosoftAuthResponse> {
        return new Promise(async (resolve, reject) => {
            try {

                const microsoftAuthRes = await got.post<MicrosoftAuthResponse>(this._tokenUri, {
                    form: {
                        client_id: this._clientId,
                        code: authCode,
                        grant_type: "authorization_code",
                        redirect_uri: "https://login.microsoftonline.com/common/oauth2/nativeclient",
                    },
                    responseType: "json"
                });

                console.log(microsoftAuthRes);

                return resolve(microsoftAuthRes.body);

            } catch (error) {
                reject(error);
            }
        });
    }

    public refreshAccessToken(refreshToken: string): Promise<RefreshAccessTokenResponse> {
        return new Promise(async (resolve, reject) => {
            try {

                const microsoftRefreshAccessRes = await got.post<RefreshAccessTokenResponse>(this._tokenUri, {
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

            } catch (error) {
                reject(error);
            }
        });
    }

    public checkMCStore(accessToken: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {

                const checkGameOwnershipRes = await got.get<any>(this._checkMCStoreUrl, {
                    headers: {
                        Authorization: "Bearer " + accessToken
                    },
                    responseType: "json"
                });

                if (checkGameOwnershipRes.body.items && checkGameOwnershipRes.body.items.length > 0) {
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

                const getProfileRes = await got.get<any>(this._getMCProfileUrl, {
                    headers: {
                        Authorization: "Bearer " + accessToken
                    },
                    responseType: "json"
                });

                return resolve(getProfileRes.body);

            } catch (error) {
                reject(error);
            }
        });
    }

    public getXBLToken(accessToken: string): Promise<XBLAuthResponse> {
        return new Promise(async (resolve, reject) => {
            try {

                const XBLAuthRes = await got.post<XBLAuthResponse>(this._authXBLUri, {
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

            } catch (error: any) {
                reject(error);
            }
        });
    }

    public getXSTSToken(XBLToken: string): Promise<XSTSAuthResponse> {
        return new Promise(async (resolve, reject) => {
            try {

                const XSTSAuthRes = await got.post<XSTSAuthResponse>(this._authXSTSUri, {
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

            } catch (error) {
                reject(error);
            }
        });
    }

    public getMCAccessToken(UHS: string, XSTSToken: string): Promise<MinecraftAuthResponse> {
        return new Promise(async (resolve, reject) => {
            try {

                const minecraftAuthRes = await got.post<MinecraftAuthResponse>(this._authMCUri, {
                    json: {
                        identityToken: `XBL3.0 x=${UHS};${XSTSToken}`
                    },
                    headers: this._STANDARD_HEADERS,
                    responseType: "json"
                });

                return resolve(minecraftAuthRes.body);

            } catch (error) {
                reject(error);
            }
        });
    }
}