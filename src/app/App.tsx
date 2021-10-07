import React from "react";
import styles from "./App.scss";

import {
    HashRouter,
    Switch,
    Route,
    useHistory
} from "react-router-dom";

import Main from "./renderer/main/Main";
import Login from "./renderer/login/Login";

export default function App() {
    return (
        <HashRouter>
            <Switch>
                <Route exact path="/" children={<InitLoading />}></Route>
                <Route path="/main" children={<Main />}></Route>
                <Route path="/login" children={<Login />}></Route>
            </Switch>
        </HashRouter>
    );
}

function InitLoading() {

    const history = useHistory();

    history.push("/login");

    return (
        <div>
            <h1>Loading...</h1>
        </div>
    );
}
