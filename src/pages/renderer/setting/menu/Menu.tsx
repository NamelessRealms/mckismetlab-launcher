import React from "react";
import styles from "./Menu.scss";
import { useTranslation } from "react-i18next";
// import settingImg from "../../../../../assets/icons/settings.png";

type IProps = {
    menuType: number;
    onClickMenuButton?: (menuType: number) => void;
    onClickBackButton?: () => void;
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

                    <h1>{t("setting.menu.title_1.title")}</h1>
                    <div>
                        <h2 
                            style={ menuType === 1 ? { background: "#1E1E1E", color: "#ffff" } : {} } 
                            onClick={() => onClickMenuButton(1)}
                        >{t("setting.menu.title_1.subTitle_1")}</h2>
                        <h2 
                            style={ menuType === 2 ? { background: "#1E1E1E", color: "#ffff" } : {} }
                            onClick={() => onClickMenuButton(2)}    
                        >{t("setting.menu.title_1.subTitle_2")}</h2>
                        <h2 
                            style={ menuType === 3 ? { background: "#1E1E1E", color: "#ffff" } : {} }
                            onClick={() => onClickMenuButton(3)}
                        >{t("setting.menu.title_1.subTitle_3")}</h2>
                    </div>

                    <div className={styles.tr}></div>

                    <h1>{t("setting.menu.title_2.title")}</h1>
                    <div>
                        <h2 
                            style={ menuType === 4 ? { background: "#1E1E1E", color: "#ffff" } : {} }
                            onClick={() => onClickMenuButton(4)}    
                        >{t("setting.menu.title_2.subTitle_1")}</h2>
                        <h2
                            style={ menuType === 5 ? { background: "#1E1E1E", color: "#ffff" } : {} }
                            onClick={() => onClickMenuButton(5)}    
                        >{t("setting.menu.title_2.subTitle_2")}</h2>
                    </div>

                </div>

                {/* <div className={styles.backButtonDiv}>
                    <img src={settingImg} alt="setting" onClick={props.onClickBackButton}/>
                    <h1 onClick={props.onClickBackButton}>返回主畫面</h1>
                </div> */}

            </div>

        </div>
    );
}