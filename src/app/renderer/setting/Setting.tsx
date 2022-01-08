import React from "react";
import styles from "./Setting.scss";

import Menu from "./menu/Menu";
import General from "./components/general/General";
import Parameters from "./components/parameters/Parameters";
import Language from "./components/language/Language";
import Changelog from "./components/changelog/Changelog";
import Information from "./components/information/Information";

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

    return (
        <div className={styles.settingDiv}>
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
