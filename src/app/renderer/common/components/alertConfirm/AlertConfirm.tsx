import React from "react";
import ButtonFocus from "../buttonFocus/ButtonFocus";
import styles from "./AlertConfirm.scss";

type IProps = {
    title: string,
    description: string,
    onConfirmClick?: () => void,
    onCancelClick?: () => void
}

export default function AlertConfirm(props: IProps) {

    return (
        <div className={styles.alertBackground}>
            <div className={styles.alertConfirmDiv}>
                <h1 className={styles.title}>{props.title}</h1>
                <h2 className={styles.description}>{props.description}</h2>
                <div className={styles.buttonDiv}>
                    <ButtonFocus className={styles.buttonFocusCancel} onClick={props.onCancelClick} content="取消" />
                    <ButtonFocus className={styles.buttonFocusConfirm} onClick={props.onConfirmClick} content="確認" />
                </div>
            </div>
        </div>
    )
}