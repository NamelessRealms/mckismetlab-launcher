import ReactDOM from "react-dom/client";
// import "./assets/fonts/jf-openhuninn-1.1.ttf";
import "./i18n.ts";
import "./styles.scss";
import App from "./pages/App";
// import ViewManager from "./pages/ViewManager";
// ReactDom.render(<ViewManager />, document.getElementById("root"));
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<App />);
