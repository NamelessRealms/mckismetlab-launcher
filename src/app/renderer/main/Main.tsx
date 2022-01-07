import React from "react";
import styles from "./Main.scss";

import TopPlayer from "./components/topPlayer/TopPlayer";
import LeftMenu from "./components/leftMenu/LeftMenu";

import BackgroundImg from "../../../assets/images/background/background.png";
import role01Img from "../../../assets/images/role/role-01.png";
import settingLinesImg from "../../../assets/icons/setting-lines.png";
import playImg from "../../../assets/icons/play.png";

export default function Main() {

    const servers = [
        {
            title: "副服模組包伺服器",
            img: "",
            onClick: () => {
                console.log("副服模組包伺服器");
            }
        },
        {
            title: "測試服伺服器",
            img: "",
            onClick: () => {
                console.log("測試服伺服器");
            }
        }
    ]

    return (
        <div className={styles.mainDiv} style={{ backgroundImage: `url(${BackgroundImg})` }}>

            <div className={styles.scrollDiv}>

                <TopPlayer />

                <div className={styles.playServerGameDiv}>

                    <div className={styles.leftDiv}>
                        <h1>無名伺服器</h1>
                        <h2>主服模組包伺服器</h2>
                        <div className={styles.buttonDiv}>
                            <div className={styles.settingButton}>
                                <img src={settingLinesImg} alt="setting-lines" />
                            </div>
                            <div className={styles.playButton}>
                                <h1>開始遊戲</h1>
                                <img src={playImg} />
                            </div>
                        </div>
                    </div>

                    <div className={styles.rightDiv}>
                        <img src={role01Img} alt="role" />
                    </div>

                </div>

                <div className={styles.serverListDiv}>

                    <div className={styles.leftDiv}>
                        <h1>伺服器</h1>
                    </div>

                    <div className={styles.rightDiv}>
                        {
                            servers.map(item => (
                                <div className={styles.serverDiv} onClick={item.onClick}>
                                    <div className={styles.serverBorderDiv}>
                                        <div>

                                        </div>
                                    </div>
                                    <h1>{item.title}</h1>
                                </div>
                            ))
                        }
                    </div>
                </div>

                <div className={styles.aboutDiv}>

                        <div className={styles.leftDiv}>
                            <h1>關於</h1>
                            <h2>我們提供大家能一起多人模組遊玩平台、模組討論區等伺服服務，讓你不用煩惱自架伺服器、如何跟朋友遊玩、不會玩模組的問題，並且我們有專屬無名啟動器幫助你裝模組、模組包，無名啟動器幫你解決一切問題(無名啟動器剛推出有BUG一定要說，讓我們來改進)。</h2>
                        </div>

                        <div className={styles.rightDiv}>
                            <div>
                                <h1>官方網站</h1>
                                <h2 className={styles.link}>https://mckismetlab.net</h2>
                            </div>
                            <div>
                                <h1>伺服器版本</h1>
                                <h2>1.16.5</h2>
                            </div>
                        </div>

                </div>

            </div>

        </div>
    );
}