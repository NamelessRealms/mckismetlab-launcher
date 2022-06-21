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
                "新增內部錯誤報告訊息"
            ]
        },
        // {
        //     title: "修復",
        //     color: "#e93232",
        //     descriptions: [
        //         "修復 log4j 漏洞"
        //     ]
        // },
        {
            title: "移除",
            color: "#dda50c",
            descriptions: [
                "移除 Mojang 登入"
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