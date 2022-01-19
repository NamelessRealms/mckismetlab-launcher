import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import App from "./App";

export default class ViewManager extends Component {

    public static Views() {
        return [
            {
                id: "main",
                view: <App />,
            },
            {
                id: "gameLog",
                view: <div>Game Log.</div>
            }
        ]
    }

    public static View(props: any) {

        let name = props.location.search.substr(1);
        if (name.includes("=")) {
            name = name.slice(0, name.indexOf("="));
        }

        let view = ViewManager.Views().find((item) => item.id === name);
        if (view === undefined) throw new Error("View '" + name + "' is undefined.");

        return view.view;
    }

    render(): React.ReactNode {
        return (
            <BrowserRouter>
                <Route path="/" component={ViewManager.View}/>
            </BrowserRouter>
        )
    }
}