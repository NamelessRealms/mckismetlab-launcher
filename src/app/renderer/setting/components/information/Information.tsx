import React from "react";
import ButtonFocus from "../../../common/components/buttonFocus/ButtonFocus";
import styles from "./Information.scss";

import developerQuasiImg from "../../../../../assets/images/developers/Quasi.jpg";
import githubIconImg from "../../../../../assets/icons/github.png";

export default function Information() {

    return (
        <div className={styles.informationDiv}>
            
            <div className={styles.launcherInfoDiv}>

                <div className={styles.leftDiv}>
                    <h1>啟動器 Launcher</h1>
                    <h2>Version: 0.4.0-BETA</h2>
                </div>
                <div className={styles.rightDiv}>
                    <ButtonFocus className={styles.buttonFocus} content="回報啟動器錯誤" />
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
                            <h2>無名伺服器擔任伺服主兼管理員</h2>
                        </div>

                    </div>

                    <div className={styles.rightDiv}>
                        <img src={githubIconImg} alt="github-icon" />
                    </div>

                </div>

            </div>

        </div>
    );
}