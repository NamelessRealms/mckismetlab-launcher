import React from "react";
import styles from "./Frame.scss";

export default function Frame() {
    return (
        <div className={styles.frameDiv}>
            <div className={styles.textDiv}>
                <h1>BETA</h1>
            </div>
            <div className={styles.frameButtonDiv}>
                <button onClick={minimize}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 8 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M6 19h12v2H6v-2z" /></svg>
                </button>
                <button onClick={maximize}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 20" width="20px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M19 4H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H5V6h14v12z" /></svg>
                </button>
                <button className={styles.closeButton} onClick={close}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" /></svg>
                </button>
            </div>
        </div>
    );
}

function minimize(): void {
    window.electron.windowApi.minimize();
}

function maximize(): void {
    window.electron.windowApi.maximize();
}

function close(): void {
    window.electron.windowApi.close();
}
