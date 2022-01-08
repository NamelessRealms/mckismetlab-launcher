import React from "react";
import Toggle from "../../../common/components/toggle/Toggle";
import styles from "./General.scss";

export default function General() {

    const items = [
        {
            label: "遊戲啟動時仍保持啟動器開啟",
            description: "若關閉此功能，也將停用開啟監控遊戲日誌視窗功能",
            onToggle: (state: boolean) => {

            }
        },
        {
            label: "遊戲啟動時開啟監控遊戲日誌視窗",
            description: "",
            onToggle: (state: boolean) => {

            }
        }
    ];

    return (
        <div className={styles.generalDiv}>
            {
                items.map((item) => (
                    <div className={styles.itemDiv}>
                        <div className={styles.itemLeftDiv}>
                            <h1>{item.label}</h1>
                            <h2>{item.description}</h2>
                        </div>
                        <div className={styles.itemRightDiv}>
                            <Toggle className={styles.toggle} state={true} onChange={item.onToggle} />
                        </div>
                    </div>
                ))
            }
        </div>
    );
}