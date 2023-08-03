import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";

import App from "./App";
import MainGameLog from "./renderer/gameLogView/MainGameLog";

export default class ViewManager extends Component {

    public static Views() {
        return [
            {
                id: "main",
                view: App,
            },
            {
                id: "gameLog",
                view: MainGameLog
            }
        ]
    }

    public static View(props: any) {

        const search = props.location.search.substr(1);
        const searchArray = search.split("&");
        const viewId = searchArray[0].slice(searchArray[0].indexOf("=") + 1, searchArray[0].length);

        let view = ViewManager.Views().find((item) => item.id === viewId);
        if (view === undefined) throw new Error("View '" + viewId + "' is undefined.");

        if(view.id === "main") {
            return <view.view />
        } else if(view.id === "gameLog") {
            const serverId = searchArray[1].slice(searchArray[1].indexOf("=") + 1, searchArray[1].length);
            return <view.view serverId={serverId} />;
        }

        return null;
    }

    public render(): React.ReactNode {

        return (
            <BrowserRouter>
                <Route path="/" component={ViewManager.View}/>
            </BrowserRouter>
        )
    }
}