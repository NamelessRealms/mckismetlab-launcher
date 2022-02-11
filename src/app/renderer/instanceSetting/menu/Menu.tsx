import React from "react";
import ButtonFocus from "../../common/components/buttonFocus/ButtonFocus";
import styles from "./Menu.scss";

type IProps = {
    menuType: number;
    serverId: string;
    onClickMenuButton?: (menuType: number) => void;
}

export default function menu(props: IProps) {

    const [menuType, setMenuType] = React.useState(props.menuType);

    const onClickMenuButton = (type: number) => {

        setMenuType(type);

        if (props.onClickMenuButton !== undefined) {
            props.onClickMenuButton(type);
        }
    }

    return (
        <div className={styles.menuDiv}>

            <div className={styles.menuContentDiv}>

                <div className={styles.menuContentButtonDiv}>

                    <h1>設定</h1>
                    <div>
                        <h2
                            style={menuType === 1 ? { background: "#1E1E1E", color: "#ffff" } : {}}
                            onClick={() => onClickMenuButton(1)}
                        >Java</h2>
                        <h2
                            style={menuType === 2 ? { background: "#1E1E1E", color: "#ffff" } : {}}
                            onClick={() => onClickMenuButton(2)}
                        >模組</h2>
                        <h2
                            style={menuType === 3 ? { background: "#1E1E1E", color: "#ffff" } : {}}
                            onClick={() => onClickMenuButton(3)}
                        >資源包</h2>
                    </div>

                    <div className={styles.tr}></div>

                    <h1>資料</h1>
                    <div>
                        <h2
                            style={menuType === 4 ? { background: "#1E1E1E", color: "#ffff" } : {}}
                            onClick={() => onClickMenuButton(4)}
                        >螢幕截圖</h2>
                    </div>

                    <div className={styles.tr}></div>

                    <h1>功能</h1>
                    <div>
                        <h2
                            style={menuType === 5 ? { background: "#1E1E1E", color: "#ffff" } : {}}
                            onClick={() => onClickMenuButton(5)}
                        >掃描修復</h2>
                    </div>
                    {/* <div className={styles.functionButtonDiv}>
                        <ButtonFocus className={`${styles.functionButton} ${styles.functionFixButton}`} content="掃描與修復" />
                    </div> */}

                    <div className={styles.tr}></div>

                    <h1>開啟</h1>
                    <div className={styles.functionButtonDiv}>
                        <ButtonFocus className={styles.functionButton} content="目錄資料夾" onClick={() => {
                            const gameMinecraftDirPath = window.electron.path.getGameMinecraftDirPath(props.serverId);
                            window.electron.open.pathFolder(gameMinecraftDirPath);
                        }}/>
                        <ButtonFocus className={styles.functionButton} content="模組資料夾" onClick={() => {
                            const gameModsDirPath = window.electron.path.getGameModsDirPath(props.serverId);
                            window.electron.open.pathFolder(gameModsDirPath);
                        }} />
                    </div>

                </div>

            </div>

        </div>
    );
}