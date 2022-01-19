import React from "react";
import ReactDom from "react-dom";
import "./i18n.ts";

import App from "./app/App";
import ViewManager from "./app/ViewManager";

// ReactDom.render(<App />, document.getElementById("root"));
ReactDom.render(<ViewManager />, document.getElementById("root"));
