import React from "react";
import styles from "./TopPlayer.scss";
import cloudDownloadImg from "../../../../../assets/icons/cloud-download.png";
import pauseImg from "../../../../../assets/icons/pause.png";

export default function TopPlayer() {

    return (
        <div className={styles.topPlayerDiv}>

            <div className={styles.leftDiv}>

                <div className={styles.downloadStatusDiv}>
                    <img className={styles.cloudDownloadImg} src={cloudDownloadImg} alt="cloud-download" />
                    <div className={styles.progressBarDiv}>
                        <h1>下載並驗證資源索引...</h1>
                        <div className={styles.progressBarOutside}>
                            <div className={styles.progressBarInside}></div>
                        </div>
                    </div>
                    <h1>86%</h1>
                    <img className={styles.pauseImg} src={pauseImg} alt="pause" />
                </div>
            </div>

            <div className={styles.rightDiv}>

                <h1>QuasiMkl</h1>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px"><path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/></svg>
            
                <div className={styles.playerImgDiv}>
                    <div></div>
                </div>

            </div>

        </div>
    );
}