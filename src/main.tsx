import React from "react";
import ReactDom from "react-dom";
import "./assets/fonts/jf-openhuninn-1.1.ttf";
import "./i18n.ts";
import "./styles.scss";

import ViewManager from "./app/ViewManager";

ReactDom.render(<ViewManager />, document.getElementById("root"));
