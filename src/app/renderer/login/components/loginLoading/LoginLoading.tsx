import React from "react";
import styles from "./LoginLoading.scss";

import { useTranslation } from "react-i18next";
import CircLoading from "../../../common/animations/components/CircleLoading/CircleLoading";
export default function LoginLoading() {

    const { t } = useTranslation();

    return (
        <div className={styles.loginLoadingDiv}>

            <h1>{t("login.loadingText")}</h1>
            <CircLoading />

        </div>
    );
}