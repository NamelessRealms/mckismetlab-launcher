import React from "react";
import styles from "./Changelog.scss";

import { useTranslation } from "react-i18next";

export default function Changelog() {

    const { t } = useTranslation();

    const contextList = [
        {
            title: "更新",
            color: "#0dc468",
            descriptions: [
                "使用者UI回到最初的版本v0.1.0，改善幾乎全部操作介面。",
                "新增可以在啟動器上安裝材質包。",
                "新增可以在啟動器上預覽遊戲內截圖。",
                "新增語言 - 英文。",
                "新增 Discord Rich Presence",
                "現在啟動器已支援 MacOS 作業系統。",
                "新增更簡單的自動回報錯誤功能。"
            ]
        },
        {
            title: "修復",
            color: "#e93232",
            descriptions: [
                "修復 log4j 漏洞"
            ]
        },
        {
            title: "移除",
            color: "#dda50c",
            descriptions: [
                "移除回報功能"
            ]
        }
    ]

    return (
        <div className={styles.changelogDiv}>

            <h1 className={styles.headline}>{t("setting.menu.title_2.subTitle_1")}</h1>
            <h2 className={styles.versionText}>{`v${window.electron.launcherVersion}`}</h2>

            {
                contextList.map(item => (
                    <div key={window.electron.uuid.getUUIDv4()} className={styles.item}>

                        <div className={styles.titleDiv}>
                            <h1 className={styles.title} style={{ color: item.color }}>{item.title}</h1>
                            {/* <div className={styles.titleTr}></div> */}
                        </div>
                        
                        {
                            item.descriptions.map(item => (
                                <div className={styles.descriptionItem} key={window.electron.uuid.getUUIDv4()}>
                                    <div className={styles.circle}></div>
                                    <h1 className={styles.descriptionText}>{item}</h1>
                                </div>
                            ))
                        }

                    </div>
                ))
            }

        </div>
    );
}