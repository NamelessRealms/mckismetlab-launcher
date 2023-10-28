import React from "react";
import ButtonFocus from "../../common/components/buttonFocus/ButtonFocus";
import styles from "./Menu.scss";

import { useTranslation } from "react-i18next";

type IProps = {
    menuType: number;
    serverId?: string;
    onClickMenuButton?: (menuType: number) => void;
}

export default function Menu(props: IProps) {

    const { t } = useTranslation();
    const [menuType, setMenuType] = React.useState(props.menuType);

    const onClickMenuButton = (type: number) => {

        setMenuType(type);

        if(props.onClickMenuButton !== undefined) {
            props.onClickMenuButton(type);
        }
    }

    return (
        <div className={styles.menuDiv}>

            <div className={styles.menuContentDiv}>

                <div className={styles.menuContentButtonDiv}>

                    <h1>{t("mainGameLog.menu.title_1.title")}</h1>
                    <div>
                        <h2
                            style={menuType === 1 ? { background: "#1E1E1E", color: "#ffff" } : {}}
                            onClick={() => onClickMenuButton(1)}
                        >{t("mainGameLog.menu.title_1.subTitle_1")}</h2>
                    </div>

                    <div className={styles.tr}></div>

                    <h1>{t("mainGameLog.menu.title_2.title")}</h1>
                    <div className={styles.functionButtonDiv}>

                        <ButtonFocus className={styles.functionButton} content={t("mainGameLog.menu.title_2.subTitle_1") as string} onClick={() => {
                            
                            if(props.serverId === undefined) return;
                            const gameLogsDirPath = window.gameLogElectron.path.getGameLogsDirPath(props.serverId);
                            window.gameLogElectron.open.pathFolder(gameLogsDirPath);

                        }}/>

                    </div>

                </div>

            </div>

        </div>
    );
}