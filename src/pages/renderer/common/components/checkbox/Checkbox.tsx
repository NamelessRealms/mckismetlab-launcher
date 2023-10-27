import React from "react";
import styles from "./Checkbox.scss";

type IProps = {
    checked: boolean;
    content?: string;
    className?: string;
    onClickChecked?: (state: boolean) => void;
}
export default function Checkbox(props: IProps) {

    return (
        <div className={`${styles.checkboxDiv} ${props.className}`}>

            <label className={styles.container}>
                <h1 className={styles.text}>{props.content}</h1>
                <input type="checkbox" className={styles.checkbox} checked={props.checked} onChange={(event) => {

                    if (props.onClickChecked === undefined) return;
                    props.onClickChecked(event.target.checked);

                }} />
                <span className={styles.checkMark}></span>
            </label>

        </div>
    );
}