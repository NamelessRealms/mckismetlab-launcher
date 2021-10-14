import React from "react";
import styles from "./MojangLogin.scss";

import { useTranslation } from "react-i18next";

import InputIcon from "../../../common/components/inputIcon/InputIcon";
import Toggle from "../../../common/components/toggle/Toggle";
import Trail from "../../../common/animations/components/trail/Trail";

type IProps = {
    onBackClick: () => void;
    onLoginClick: (email: string, password: string, loginState: boolean) => void;
}

export default function MojangLogin(props: IProps) {

    const { t } = useTranslation();

    const [open, setOpen] = React.useState(true);

    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [loginState, setLoginState] = React.useState(true);

    return (
        <div className={styles.mojangLoginDiv}>

            <Trail open={open}>

                <h1>{t("login.title")}</h1>
                <h2>{t("login.subTitle_2")}</h2>

                <InputIcon className={styles.inputIcon} type="email" icon="email" onChange={setEmail} />
                <InputIcon className={styles.inputIcon} type="password" icon="password" onChange={setPassword} />

                <div className={styles.loginStateDiv}>
                    <h1>{t("login.loginState")}</h1>
                    <Toggle className={styles.toggle} state={loginState} onChange={setLoginState} />
                </div>

                {/* <button>{t("login.buttonText")}</button> */}

                <div className={styles.loginButtonDiv}>
                    <input type="checkbox" id="loginStateCheckBox" />
                    <label className={styles.loginButton} htmlFor="loginStateCheckBox" onClick={() => {

                        setOpen(false);
                        setTimeout(() => props.onLoginClick(email, password, loginState), 500);

                    }}>{t("login.buttonText")}</label>
                </div>

                <div className={styles.loginBottomDiv}>
                    <h1 onClick={() => {

                        setOpen(false);
                        setTimeout(props.onBackClick, 200);

                    }}>{t("login.backSelect")}</h1>
                    <h1 onClick={() => { window.open("https://www.minecraft.net/zh-hant/password/forgot") }}>{t("login.forgetPassword")}</h1>
                </div>

            </Trail>

        </div>
    );
}