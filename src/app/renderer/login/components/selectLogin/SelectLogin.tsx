import React from "react";
import styles from "./SelectLogin.scss";
import Trail from "../../../common/animations/components/trail/Trail";
import DropMenu from "../../../common/components/dropMenu/DropMenu";

import { useTranslation } from "react-i18next";

type IProps = {
    onMojangClick: () => void;
    onMicrosoftClick: () => void;
}

export default function SelectLogin(props: IProps) {

    const { t, i18n } = useTranslation();
    const [open, setOpen] = React.useState(true);

    const langs = [
        {
            id: "zh_TW",
            value: t("setting.components.language.zh_tw.description")
        },
        {
            id: "en_US",
            value: t("setting.components.language.en_us.description")
        }
    ]

    return (
        <div className={styles.selectLoginDiv}>

            <div className={styles.dropMenuDiv}>
                <DropMenu items={langs} value={window.electron.io.language.get()} onChange={(id) => {
                    i18n.changeLanguage(id);
                    window.electron.io.language.set(id);
                }} />
            </div>

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