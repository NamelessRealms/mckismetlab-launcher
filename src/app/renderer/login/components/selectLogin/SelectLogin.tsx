import React from "react";
import styles from "./SelectLogin.scss";
import Trail from "../../../common/animations/components/trail/Trail";

import { useTranslation } from "react-i18next";

type IProps = {
    onMojangClick: () => void;
    onMicrosoftClick: () => void;
}

export default function SelectLogin(props: IProps) {

    const { t } = useTranslation();

    const [open, setOpen] = React.useState(true);

    return (
        <div className={styles.selectLoginDiv}>

            <Trail open={open}>
                <h1>{t("login.title")}</h1>
                <h2>{t("login.subTitle_1")}</h2>
                <div className={styles.buttonDiv}>
                    <button onClick={props.onMicrosoftClick}>
                        <p>Microsoft</p>
                        <span>登入</span>
                    </button>
                    <br />
                    <button onClick={() => {
                        
                        setOpen(false);
                        setTimeout(props.onMojangClick, 200);

                    }}>
                        <p>Mojang</p>
                        <span>登入</span>
                    </button>
                </div>
            </Trail>
        </div>
    );
}