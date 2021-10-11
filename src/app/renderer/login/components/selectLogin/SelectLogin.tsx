import React from "react";
import styles from "./SelectLogin.scss";

import { useTranslation } from "react-i18next";
export default function SelectLogin() {

    const { t } = useTranslation();

    return (
        <div className={styles.selectLoginDiv}>
            <h1>{t("login.title")}</h1>
            <h2>{t("login.subTitle_1")}</h2>
            <div className={styles.buttonDiv}>
                <button>
                    <p>Microsoft</p>
                    <span>登入</span>
                </button>
                <br />
                <button>
                    <p>Mojang</p>
                    <span>登入</span>
                </button>
            </div>
        </div>
    );
}