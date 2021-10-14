import React from "react";
import styles from "./Login.scss";

import SelectLogin from "./components/selectLogin/SelectLogin";
import MojangLogin from "./components/mojangLogin/mojangLogin";
import LoginLoading from "./components/loginLoading/LoginLoading";
export default function Login() {

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
                <SelectLogin onMicrosoftClick={microsoftLogin} onMojangClick={() => setToggleDiv(false)} />
                : 
                <MojangLogin onBackClick={() => setToggleDiv(true)} onLoginClick={() => {

                    setLoading(true);
                    minecraftLogin();

                }} />
            }
        </div>
    );
}

function microsoftLogin(): void {

    console.log("microsoft login click!");

}

function minecraftLogin(): void {

    console.log("minecraft login click!");

}