import React from "react";
import styles from "./Setting.scss";

import Menu from "./menu/Menu";
import General from "./components/general/General";
import Parameters from "./components/parameters/Parameters";
import Language from "./components/language/Language";
import Changelog from "./components/changelog/Changelog";
import Information from "./components/information/Information";
import { useHistory } from "react-router-dom";

export default function Setting() {

    const settingComponents = [
        {
            id: 1,
            component: <General />
        },
        {
            id: 2,
            component: <Parameters />
        },
        {
            id: 3,
            component: <Language />
        },
        {
            id: 4,
            component: <Changelog />
        },
        {
            id: 5,
            component: <Information />
        }
    ];

    const [menuType, setMenuType] = React.useState(1);
    const history = useHistory();

    const backMain = () => {
        
        history.push("/main");

    }

    return (
        <div className={styles.settingDiv}>
            <div className={styles.backButton} onClick={backMain}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" /></svg>
            </div>
            <div className={styles.leftDiv}>
                <Menu menuType={menuType} onClickMenuButton={setMenuType} />
            </div>
            <div className={styles.rightDiv}>
                {
                    settingComponents.map((item) => {
                        return (
                            <div key={window.electron.uuid.getUUIDv4()}>
                                {
                                    item.id === menuType ? item.component : null
                                }
                            </div>
                        );
                    })
                }
            </div>
        </div>
    );
}