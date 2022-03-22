import React from "react";
import Frame from "../common/components/Frame/Frame";
import Record from "./components/logs/Record";
import styles from "./MainGameLog.scss";
import Menu from "./menu/Menu";

type IProps = {
    serverId?: string
}

export default function MainGameLog(props: IProps) {

    const [menuType, setMenuType] = React.useState(1);

    return (
        <div className={styles.mainGameLogDiv}>

            <Frame windowName="gameLog" osType={window.gameLogElectron.os.type()} />

            <div className={styles.leftDiv}>
                <Menu menuType={menuType} onClickMenuButton={setMenuType} serverId={props.serverId} />
            </div>

            <div className={styles.rightDiv}>
                <Record />
            </div>

        </div>
    )
}