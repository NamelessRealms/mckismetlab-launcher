import React from "react";
import styles from "./InstanceSetting.scss";
import { useHistory, useParams } from "react-router-dom";
import Menu from "./menu/Menu";
import Parameters from "../common/components/parameters/Parameters";
import ModList from "./components/modList/ModList";
import ResourcePacks from "./components/resourcePacks/ResourcePacks";
import Screenshot from "./components/screenshot/Screenshot";

export default function InstanceSetting() {

    const { serverName } = useParams<{ serverName: string }>();
    const [menuType, setMenuType] = React.useState(1);
    const history = useHistory();
    const instanceSettingComponent = [
        {
            id: 1,
            component: <Parameters checkbox={true} serverName={serverName} />
        },
        {
            id: 2,
            component: <ModList />
        },
        {
            id: 3,
            component: <ResourcePacks />
        },
        {
            id: 4,
            component: <Screenshot />
        },
    ]

    const backMain = () => {
        window.electron.io.save();
        history.push("/main");
    }

    return (
        <div className={styles.instanceSettingDiv}>

            <div className={styles.backButtonBorderDiv}>
                <div className={styles.backButton} onClick={backMain}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" /></svg>
                </div>
            </div>

            <div className={styles.leftDiv}>
                <Menu menuType={1} onClickMenuButton={setMenuType} />
            </div>

            <div className={styles.rightDiv}>
                {
                    instanceSettingComponent.map((item) => {
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
