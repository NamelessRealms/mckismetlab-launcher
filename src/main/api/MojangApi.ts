import got from "got";

export default class MojangApi {

    private _authUrl = "https://authserver.mojang.com";
    private _profileUrl = "https://sessionserver.mojang.com/session/minecraft/profile";

    public authenticate(account: string, password: string, clientToken: string): Promise<any> {
        return new Promise(async (resolve, reject) => {

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

                const response = await got.post(this._authUrl + "/authenticate", {
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

            } catch (error) {
                return reject(error);
            }

        });
    }

    public validate(accessToken: string, clientToken: string): Promise<any> {
        return new Promise(async (resolve, reject) => {

            try {

                // const response = await axios.post(this._authUrl + "/validate", {
                //     accessToken: accessToken,
                //     clientToken: clientToken
                // });

                const response = await got.post(this._authUrl + "/validate", {
                    json: {
                        accessToken: accessToken,
                        clientToken: clientToken
                    }
                });

                return resolve(response);
            } catch (error) {
                return reject(error);
            }

        });
    }

    public refresh(accessToken: string, clientToken: string): Promise<any> {
        return new Promise(async (resolve, reject) => {

            try {

                // const response = await axios.post(this._authUrl + "/refresh", {
                //     accessToken: accessToken,
                //     clientToken: clientToken
                // });

                const response = await got.post(this._authUrl + "/refresh", {
                    json: {
                        accessToken: accessToken,
                        clientToken: clientToken
                    }
                });

                return resolve(response);
            } catch (error) {
                return reject(error);
            }

        });
    }

    public invalidate(accessToken: string, clientToken: string): Promise<void> {
        return new Promise(async (resolve, reject) => {

            try {

                // const response = await axios.post(this._authUrl + "/invalidate", {
                //     accessToken: accessToken,
                //     clientToken: clientToken
                // });

                const response = await got.post(this._authUrl + "/invalidate", {
                    json: {
                        accessToken: accessToken,
                        clientToken: clientToken
                    }
                });

                if (response.statusCode === 204 || response.statusCode === 403) {
                    return resolve();
                } else {
                    return reject();
                }

            } catch (error) {
                reject(error);
            }

        });
    }

    public profile(uuid: string): Promise<any> {
        return new Promise(async (resolve, reject) => {

            try {

                // const response = await axios.get(this._profileUrl + `/${uuid}`);

                const response = await got.get(this._profileUrl + `/${uuid}`);

                if (response.statusCode === 200) {
                    return resolve(response);
                } else {
                    return reject(response);
                }

            } catch (error) {
                return reject(error);
            }

        });
    }
}