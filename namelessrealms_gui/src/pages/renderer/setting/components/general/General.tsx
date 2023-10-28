import React from "react";
import Toggle from "../../../common/components/toggle/Toggle";
import styles from "./General.scss";

import { useTranslation } from "react-i18next";

// const dataItems = [
//     {
//         id: 1,
//         label: "遊戲啟動時仍保持啟動器開啟",
//         description: "若關閉此功能，也將停用開啟監控遊戲日誌視窗功能",
//         state: window.electron.io.general.getOpenGameKeepLauncherState(),
//         linkIds: [2]
//     },
//     {
//         id: 2,
//         label: "遊戲啟動時開啟監控遊戲日誌視窗",
//         description: "",
//         state: window.electron.io.general.getGameStartOpenMonitorLog(),
//         linkIds: []
//     }
// ];

export default function General() {

    const { t } = useTranslation();
    const io = window.electron.io;
    const [openGameKeepLauncherState, setOpenGameKeepLauncherState] = React.useState(io.general.getOpenGameKeepLauncherState());
    const [gameStartOpenMonitorLog, setGameStartOpenMonitorLog] = React.useState(io.general.getGameStartOpenMonitorLog());
    const [gameStartOpenMonitorLogHide, setGameStartOpenMonitorLogHide] = React.useState(io.general.getOpenGameKeepLauncherState());

    const onToggleClick = (id: number, state: boolean) => {
        setTimeout(() => {
            switch (id) {
                case 0:
                    setOpenGameKeepLauncherState(state);
                    io.general.setOpenGameKeepLauncherState(state);
                    if (!state) {
                        setGameStartOpenMonitorLogHide(false);
                        setGameStartOpenMonitorLog(false);
                        io.general.setGameStartOpenMonitorLog(false);
                    } else {
                        setGameStartOpenMonitorLogHide(true);
                    }
                    break;
                case 1:
                    setGameStartOpenMonitorLog(state);
                    io.general.setGameStartOpenMonitorLog(state);
                    break;
            }
        }, 400)
    }

    return (
        <div className={styles.generalDiv}>

            <h1 className={styles.headline}>{t("setting.menu.title_1.subTitle_1")}</h1>

            <div key={window.electron.uuid.getUUIDv4()} className={styles.itemDiv}>
                <div className={styles.itemLeftDiv}>
                    <h1>{t("setting.components.general.item_1.title")}</h1>
                    <h2>{t("setting.components.general.item_1.dependencies")}</h2>
                </div>
                <div className={styles.itemRightDiv}>
                    <Toggle className={styles.toggle} state={openGameKeepLauncherState} onChange={(state) => onToggleClick(0, state)} />
                </div>
            </div>
            <div key={window.electron.uuid.getUUIDv4()} className={styles.itemDiv}>
                {gameStartOpenMonitorLogHide ? null : <div className={styles.disabledDiv}></div>}
                <div className={styles.itemLeftDiv}>
                    <h1>{t("setting.components.general.item_2.title")}</h1>
                </div>
                <div className={styles.itemRightDiv}>
                    <Toggle className={styles.toggle} state={gameStartOpenMonitorLog} onChange={(state) => onToggleClick(1, state)} />
                </div>
            </div>
        </div>
    );
}

// export default function General() {

//     const [items, setItems] = React.useState(dataItems);

//     const onToggle = (id: number, state: boolean) => {
//         setItems((items) => {
//             items.forEach((item, index, array) => {
//                 if (item.id === id) {
//                     if (!state) {
//                         for (let linkId of array[index].linkIds) {
//                             array[linkId - 1].state = false;
//                         }
//                     }
//                     return array[index].state = state;
//                 } else {
//                     return array[index];
//                 }
//             });
//             return items;
//         });
//     }

//     return (
//         <div className={styles.generalDiv}>
//             {
//                 items.map((item) => (
//                     <div key={window.electron.uuid.getUUIDv4()} className={styles.itemDiv}>
//                         <div className={styles.itemLeftDiv}>
//                             <h1>{item.label}</h1>
//                             <h2>{item.description}</h2>
//                         </div>
//                         <div className={styles.itemRightDiv}>
//                             <Toggle className={styles.toggle} state={item.state} onChange={(state) => onToggle(item.id, state)} />
//                         </div>
//                     </div>
//                 ))
//             }
//         </div>
//     );
// }