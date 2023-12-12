import React from "react";
import { invoke } from "@tauri-apps/api/tauri";

// import {
//     Route,
//     HashRouter,
//     BrowserRouter,
// } from "react-router-dom";

import { useTranslation } from "react-i18next";

// import Main from "./renderer/main/Main";
// import Login from "./renderer/login/Login";
import Frame from "./renderer/common/components/Frame/Frame";
import InitLoading from "./renderer/common/animations/components/initLoading/InitLoading";
// import Setting from "./renderer/setting/Setting";
// import InstanceSetting from "./renderer/instanceSetting/InstanceSetting";

export default function App() {

    const [osType, setOSType] = React.useState<"osx" | "windows" | "linux" | "unknown">("unknown");

    React.useEffect( () => {
        init();
    }, []);

    const init = async () => {
        setOSType(await invoke("get_os_type"));
        console.log(await invoke("get_java_paths"));
        console.log(await invoke("get_launcher_settings"));
    }

    const { t } = useTranslation();

    return (
        <>
            <Frame windowName="main" osType={osType} />
            
            <InitLoading text={t("loading.text_1")} />

            {/* <HashRouter>
                <Switch>
                    <Route exact path="/"><Init /></Route>
                    <Route path="/main"><Main /></Route>
                    <Route path="/login"><Login /></Route>
                    <Route path="/settings"><Setting /></Route>
                    <Route path="/instanceSetting/:serverId/:paramsMenuType"><InstanceSetting /></Route>
                </Switch>
            </HashRouter> */}
        </>
    );
}

// function Init() {

//     const { t } = useTranslation();
//     const history = useHistory();

//     React.useEffect(() => {
//         // validateAccessToken(history);
//     }, []);

//     return (
//         <InitLoading text={t("loading.text_1")} />
//     );
// }

// async function validateAccessToken(history: any) {
//     if(await window.electron.auth.isValidateAccessToken()) {
//         history.push("/main");
//     } else {
//         history.push("/login");
//     }
// }