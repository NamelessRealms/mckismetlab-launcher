import React from "react";
import styles from "./ProgressBar.scss";

type IProps = {
    text?: string;
    percentage: number;
    color: string;
    className?: string;
}

export default function ProgressBar(props: IProps) {

    return (
        <div className={`${styles.progressBarDiv} ${props.className}`}>

            <div className={styles.playButtonBackground} style={{ width: `${props.percentage}%`, backgroundColor: props.color }}></div>
            <h1 className={styles.progressBarText}>{props.text}</h1>

        </div>
    )
}