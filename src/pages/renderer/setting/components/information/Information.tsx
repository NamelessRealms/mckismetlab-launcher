import React from "react";
import ButtonFocus from "../../../common/components/buttonFocus/ButtonFocus";
import styles from "./Information.scss";

import developerQuasiImg from "../../../../../assets/images/developers/Quasi.jpg";
import githubIconImg from "../../../../../assets/icons/github.png";

import { useTranslation } from "react-i18next";

export default function Information() {

    const { t } = useTranslation();

    return (
        <div className={styles.informationDiv}>
            
            <div className={styles.launcherInfoDiv}>

                <div className={styles.leftDiv}>
                    <h1>{t("setting.components.information.launcherInfo.title_1")}</h1>
                    <h2>{t("setting.components.information.launcherInfo.title_2")} {window.electron.launcherVersion}</h2>
                </div>
                <div className={styles.rightDiv}>
                    <ButtonFocus className={styles.buttonFocus} content="回報啟動器錯誤" onClick={() => window.open("https://github.com/QuasiMkl/mckismetlab-launcher/issues/new/choose")} />
                </div>

            </div>

            <div className={styles.developersListDiv}>

                <div className={styles.developersDiv}>

                    <div className={styles.leftDiv}>

                        <div className={styles.leftLeftDiv}>
                            <img src={developerQuasiImg} alt="Quasi" />
                        </div>

                        <div className={styles.leftRightDiv}>
                            <h1>Quasi</h1>
                            <h2>{t("setting.components.information.developersList.developers_1.description")}</h2>
                        </div>

                    </div>

                    <div className={styles.rightDiv}>
                        <img src={githubIconImg} alt="github-icon" onClick={() => window.open("https://github.com/QuasiMkl")} />
                    </div>

                </div>

            </div>

        </div>
    );
}