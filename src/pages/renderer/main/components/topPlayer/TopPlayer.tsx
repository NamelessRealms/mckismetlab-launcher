import React from "react";
import styles from "./TopPlayer.scss";
import mckismetlabLogoImg from "../../../../../assets/images/logo/logo.png";
import Trail from "../../../common/animations/components/trail/Trail";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function TopPlayer() {

    const [open, setOpen] = React.useState(false);
    const [displayNone, setDisplayNone] = React.useState(true);
    const history = useHistory();
    const { t } = useTranslation();

    const playerMenu = [
        // {
        //     text: t("main.components.topPlayer.playerMenu.select_1"),
        //     onClick: () => {

        //         setOpen(false);

        //     }
        // },
        {
            text: t("main.components.topPlayer.playerMenu.select_2"),
            onClick: () => {
                history.push("/settings");
            }
        },
        {
            text: t("main.components.topPlayer.playerMenu.select_3"),
            onClick: () => {
                setOpen(false);
                window.electron.auth.signOut((code) => {
                    switch(code) {
                        case 0:
                            history.push("/login");
                            break;
                    }
                });
            }
        }
    ]

    return (
        <div className={styles.topPlayerDiv}>

            <div className={styles.leftDiv}>

                <img src={mckismetlabLogoImg} alt="logo" />

            </div>

            <div className={styles.rightDiv}>

                <div className={styles.playerNameDiv}>

                    <h1 onClick={() => setOpen((value) => !value)}>{window.electron.io.player.getPlayerName()}</h1>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" onClick={() => setOpen((value) => !value)}><path d="M24 24H0V0h24v24z" fill="none" opacity=".87" /><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z" /></svg>

                    <div className={styles.playerMenu} style={open ? { background: "#141414" } : displayNone ? { display: "none" } : {}}>

                        <Trail open={open} onStart={() => setDisplayNone(false)} onCloseEnd={() => setDisplayNone(true)}>
                            {
                                playerMenu.map((item) => (
                                    <div key={window.electron.uuid.getUUIDv4()} onClick={item.onClick}>
                                        <h1>{item.text}</h1>
                                    </div>
                                ))
                            }
                        </Trail>

                    </div>
                </div>

                <div className={styles.playerImgDiv}>
                    <div style={{ backgroundImage: `url(https://crafatar.com/renders/body/${window.electron.io.player.getPlayerUuid()}?scale=3&overlay)` }}></div>
                </div>

            </div>

        </div>
    );
}