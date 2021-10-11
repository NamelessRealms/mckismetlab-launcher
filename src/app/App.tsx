import React from "react";
import styles from "./App.scss";

import {
    HashRouter,
    Switch,
    Route,
    useHistory,
} from "react-router-dom";

import Main from "./renderer/main/Main";
import Login from "./renderer/login/Login";
import Frame from "./renderer/common/components/Frame/Frame";

// const routes = [
//     {
//         path: "/main",
//         component: Main
//     },
//     {
//         path: "/login",
//         component: Login,
//         routes: [
//             {
//                 path: "/selectLogin",
//                 component: SelectLogin
//             }
//         ]
//     }
// ]
export default function App() {
    return (
        <div>
            <Frame />
            <HashRouter>
                <Switch>
                    <Route exact path="/"><InitLoading /></Route>
                    <Route path="/main"><Main /></Route>
                    <Route path="/login"><Login /></Route>
                </Switch>
            </HashRouter>
        </div>
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