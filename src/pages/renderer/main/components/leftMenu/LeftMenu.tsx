import React from "react";
import styles from "./LeftMenu.scss";
import mckismetlabLogoImg from "../../../../../assets/images/logo/logo.png";
import mckismetlabLogoNoRoundImg from "../.././../../../assets/images/logo/logo-no-round.png";
import settingImg from "../../../../../assets/icons/settings.png";
import modpacksImg from "../../../../../assets/icons/modpacks.png";

const serverMenus = [
    {
        label: "Test Server",
        imgPath: mckismetlabLogoNoRoundImg
    },
    {
        label: "模組包",
        imgPath: modpacksImg
    }
];

export default function LeftMenu() {
    return (
        <div className={styles.leftMenuDiv}>

            <div className={styles.topDiv}>
                <img src={mckismetlabLogoImg} alt="logo" />
            </div>

            <div className={styles.centerDiv}>

                <div className={styles.centerTopDiv}>
                    <img src={mckismetlabLogoNoRoundImg} alt="main-server" />
                </div>
                <div className={styles.centerTrDiv}></div>
                <div className={styles.centerBottomDiv}>
                    {
                        serverMenus.map(item => (
                            <div className={styles.centerBottomImgDiv}>
                                <img src={item.imgPath} alt={item.label} />
                            </div>
                        ))
                    }
                </div>

            </div>
            
            <div className={styles.bottomDiv}>
                <img src={settingImg} alt="setting" />
            </div>

        </div>
    );
}