import React from "react";
import ButtonFocus from "../../../common/components/buttonFocus/ButtonFocus";
import Logs from "./components/logs/Logs";
import styles from "./Record.scss";

const gameLogs = new Array<string>();

export default function Record() {

    const [fontButtonType, setFontButtonType] = React.useState(1);
    const [logsFontSize, setLogsFontSize] = React.useState(16);

    const onFontClick = (type: number) => {
        setFontButtonType(type);
        switch (type) {
            case 0:
                setLogsFontSize(14);
                break;
            case 1:
                setLogsFontSize(16);
                break;
            case 2:
                setLogsFontSize(18);
                break;
        }
    }

    const downloadTxtFile = () => {
        const element = document.createElement("a");
        const file = new Blob([gameLogs.join("\n")], {
            type: "text/plain"
        });
        element.href = URL.createObjectURL(file);
        element.download = "log.txt";
        document.body.appendChild(element);
        element.click();
    };

    return (
        <div className={styles.recordDiv}>
            <div className={styles.topDiv}>
                <h1 className={styles.title}>Minecraft 遊戲記錄</h1>
                <div className={styles.fontButton}>
                    <button onClick={() => onFontClick(0)} style={{ backgroundColor: fontButtonType === 0 ? "#0A9850" : "#2b2b2b" }}>小</button>
                    <button onClick={() => onFontClick(1)} style={{ backgroundColor: fontButtonType === 1 ? "#0A9850" : "#2b2b2b" }}>中</button>
                    <button onClick={() => onFontClick(2)} style={{ backgroundColor: fontButtonType === 2 ? "#0A9850" : "#2b2b2b" }}>大</button>
                </div>
                <ButtonFocus content="匯出檔案.txt" className={styles.buttonFocus} onClick={() => downloadTxtFile()}/>
            </div>
            <Logs logsFontSize={logsFontSize} onGameLogText={(text) => gameLogs.push(text)} />
        </div>
    )
}