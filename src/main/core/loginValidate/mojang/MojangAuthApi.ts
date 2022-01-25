import * as uuid from "uuid";

import IMojangAccountAuth from "../../../interfaces/IMojangAccountAuth";
import IMojangTokenRefresh from "../../../interfaces/IMojangTokenRefresh";
import MojangApi from "../../../api/MojangApi";

export default class MojangAuthApi {

    private _mojangApi: MojangApi;
    constructor() {
        this._mojangApi = new MojangApi();
    }

    public accountAuth(account: string, password: string, clientToken: string): Promise<IMojangAccountAuth | null> {
        return new Promise(async (resolve, reject) => {

            if (account.length === 0 || password.length === 0) {
                return reject({ error: "NullPointerException", errorMessage: "account and password not null." });
            }

            if (clientToken.length === 0) {
                clientToken = uuid.v4();
            }

            try {

                const response = await this._mojangApi.authenticate(account, password, clientToken);

                if (response.statusCode === 200) {

                    return resolve({
                        data: JSON.parse(response.body),
                        clientToken: clientToken
                    });

                }

                return reject(null);

            } catch (error: any) {

                if (error.response.status === 403 && error.response.data.error === "ForbiddenOperationException") {

                    return reject({ error: error.response.data.error, errorMessage: "Invalid credentials. Invalid username or password." });
                }

                return reject(error.response);
            }

        });
    }

    public validate(accessToken: string, clientToken: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {

            try {

                const response = await this._mojangApi.validate(accessToken, clientToken);

                if (response.statusCode === 204) {
                    return resolve(true);
                }

                return resolve(false);

            } catch (error) {

                return resolve(false);

            }

        });
    }

    public refresh(accessToken: string, clientToken: string): Promise<IMojangTokenRefresh | null> {
        return new Promise(async (resolve, reject) => {

            try {

                const response = await this._mojangApi.refresh(accessToken, clientToken);

                if (response.status === 200) {
                    return resolve(JSON.parse(response.body));
                }

                return reject(null);

            } catch (error: any) {

                const bodyJsonObject = JSON.parse(error.response.body);

                if (error.response.status === 403 && bodyJsonObject.error === "ForbiddenOperationException") {

                    return reject({ error: bodyJsonObject.error, errorMessage: bodyJsonObject.errorMessage });
                }

                return reject(error.response);

            }

        });
    }

    public invalidate(accessToken: string, clientToken: string): Promise<void> {
        return new Promise(async (resolve, reject) => {

            try {

                await this._mojangApi.invalidate(accessToken, clientToken);

                return resolve();

            } catch (error) {

                return reject(error);

            }

        });
    }
}