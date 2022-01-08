import React from "react";
import styles from "./Menu.scss";
import settingImg from "../../../../../assets/icons/settings.png";

type IProps = {
    menuType: number;
    onClickMenuButton?: (menuType: number) => void;
    onClickBackButton?: () => void;
}

export default function Menu(props: IProps) {

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

                    <h1>啟動器設定</h1>
                    <div>
                        <h2 
                            style={ menuType === 1 ? { background: "#1E1E1E", color: "#ffff" } : {} } 
                            onClick={() => onClickMenuButton(1)}
                        >一般</h2>
                        <h2 
                            style={ menuType === 2 ? { background: "#1E1E1E", color: "#ffff" } : {} }
                            onClick={() => onClickMenuButton(2)}    
                        >Java</h2>
                        <h2 
                            style={ menuType === 3 ? { background: "#1E1E1E", color: "#ffff" } : {} }
                            onClick={() => onClickMenuButton(3)}
                        >語言</h2>
                    </div>

                    <div className={styles.tr}></div>

                    <h1>啟動器信息</h1>
                    <div>
                        <h2 
                            style={ menuType === 4 ? { background: "#1E1E1E", color: "#ffff" } : {} }
                            onClick={() => onClickMenuButton(4)}    
                        >更新日誌</h2>
                        <h2
                            style={ menuType === 5 ? { background: "#1E1E1E", color: "#ffff" } : {} }
                            onClick={() => onClickMenuButton(5)}    
                        >開發者</h2>
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