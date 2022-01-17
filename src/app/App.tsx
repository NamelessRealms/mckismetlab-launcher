import React from "react";
import styles from "./App.scss";

import {
    HashRouter,
    Switch,
    Route,
    useHistory,
} from "react-router-dom";

import { useTranslation } from "react-i18next";

import Main from "./renderer/main/Main";
import Login from "./renderer/login/Login";
import Frame from "./renderer/common/components/Frame/Frame";
import InitLoading from "./renderer/common/animations/components/initLoading/InitLoading";
import Setting from "./renderer/setting/Setting";
import InstanceSetting from "./renderer/instanceSetting/InstanceSetting";

export default function App() {
    return (
        <div>
            <Frame />
            <HashRouter>
                <Switch>
                    <Route exact path="/"><Init /></Route>
                    <Route path="/main"><Main /></Route>
                    <Route path="/login"><Login /></Route>
                    <Route path="/settings"><Setting /></Route>
                    <Route path="/instanceSetting/:serverName"><InstanceSetting /></Route>
                </Switch>
            </HashRouter>
        </div>
    );
}

function Init() {

    const { t } = useTranslation();
    const history = useHistory();

    validateAccessToken(history);

    return (
        <InitLoading text={t("loading.text_1")} />
    );
}

async function validateAccessToken(history: any) {
    if(await window.electron.auth.isValidateAccessToken()) {
        history.push("/main");
    } else {
        history.push("/login");
    }
}