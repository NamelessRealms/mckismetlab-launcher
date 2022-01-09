import React from "react";
import styles from "./TopPlayer.scss";
import cloudDownloadImg from "../../../../../assets/icons/cloud-download.png";
import pauseImg from "../../../../../assets/icons/pause.png";
import mckismetlabLogoImg from "../../../../../assets/images/logo/logo.png";
import Trail from "../../../common/animations/components/trail/Trail";

export default function TopPlayer() {

    const [downloadComponent, setDownloadComponent] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const [displayNone, setDisplayNone] = React.useState(true);

    const playerMenu = [
        {
            text: "切換帳號",
            onClick: () => {

                setOpen(false);

            }
        },
        {
            text: "登出",
            onClick: () => {

                setOpen(false);

            }
        }
    ]

    return (
        <div className={styles.topPlayerDiv}>

            <div className={styles.leftDiv}>

                {/* old download page */}
                {/* <div className={ styles.downloadStatusDiv } style={ downloadComponent ? {} : { display: "none" } } >
                    <img className={styles.cloudDownloadImg} src={cloudDownloadImg} alt="cloud-download" />
                    <div className={styles.progressBarDiv}>
                        <h1>下載並驗證資源索引...</h1>
                        <div className={styles.progressBarOutside}>
                            <div className={styles.progressBarInside}></div>
                        </div>
                    </div>
                    <h1>86%</h1>
                    <img className={styles.pauseImg} src={pauseImg} alt="pause" />
                </div> */}

                <img src={mckismetlabLogoImg} alt="logo" />

            </div>

            <div className={styles.rightDiv}>

                <div className={styles.playerNameDiv}>

                    <h1 onClick={() => setOpen((value) => !value)}>QuasiMkl</h1>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" onClick={() => setOpen((value) => !value)}><path d="M24 24H0V0h24v24z" fill="none" opacity=".87" /><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z" /></svg>

                    <div className={styles.playerMenu} style={open ? { background: "#141414" } : displayNone ? { display: "none" } : {}}>

                        <Trail open={open} onStart={() => setDisplayNone(false)} onCloseEnd={() => setDisplayNone(true)}>
                            {
                                playerMenu.map((item) => (
                                    <div onClick={item.onClick}>
                                        <h1>{item.text}</h1>
                                    </div>
                                ))
                            }
                        </Trail>

                    </div>
                </div>

                <div className={styles.playerImgDiv}>
                    <div></div>
                </div>

            </div>

        </div>
    );
}