import React from "react";
import styles from "./Login.scss";

import SelectLogin from "./components/selectLogin/SelectLogin";
import MojangLogin from "./components/mojangLogin/mojangLogin";
import LoginLoading from "./components/loginLoading/LoginLoading";
import { useHistory } from "react-router-dom";
export default function Login() {

    const history = useHistory();
    const [toggleDiv, setToggleDiv] = React.useState(true);
    const [loading, setLoading] = React.useState(false);

    return (
        <div className={styles.LoginDiv}>
            {
                loading
                    ?
                    <LoginLoading />
                    :
                    toggleDiv
                        ?
                        <SelectLogin onMicrosoftClick={() => microsoftLogin(history, setLoading)} onMojangClick={() => setToggleDiv(false)} />
                        :
                        <MojangLogin onBackClick={() => setToggleDiv(true)} onLoginClick={(email, password, loginState) => minecraftLogin(email, password, loginState, history, setLoading)} />
            }
        </div>
    );
}

function microsoftLogin(history: any, setLoading: Function): void {

    setLoading(true);

    window.electron.auth.microsoftLogin.openLoginWindow(true, (code) => {
        switch(code) {
            case 0:
                history.push("/main");
                break;
            case 1:
            case 2:
                setLoading(false);
                break;
        }
    });
}

function minecraftLogin(email: string, password: string, loginKeepToggle: boolean, history: any, setLoading: Function): void {

    setLoading(true);

    window.electron.auth.mojangLogin.login(email, password, loginKeepToggle, (code) => {
        if (code === 0) {
            history.push("/main");
        } else {
            setLoading(false);
        }
    });
}