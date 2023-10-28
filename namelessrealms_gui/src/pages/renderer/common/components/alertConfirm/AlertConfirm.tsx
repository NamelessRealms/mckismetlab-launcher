import React from "react";
import ButtonFocus from "../buttonFocus/ButtonFocus";
import styles from "./AlertConfirm.scss";

import { useTranslation } from "react-i18next";

type IProps = {
    title: string,
    description: string,
    onConfirmClick?: () => void,
    onCancelClick?: () => void
}

export default function AlertConfirm(props: IProps) {

    const { t } = useTranslation();

    return (
        <div className={styles.alertBackground}>
            <div className={styles.alertConfirmDiv}>
                <h1 className={styles.title}>{props.title}</h1>
                <h2 className={styles.description}>{props.description}</h2>
                <div className={styles.buttonDiv}>
                    <ButtonFocus className={styles.buttonFocusCancel} onClick={props.onCancelClick} content={t("common.components.alertConfirm.cancel.title") as string} />
                    <ButtonFocus className={styles.buttonFocusConfirm} onClick={props.onConfirmClick} content={t("common.components.alertConfirm.confirm.title") as string} />
                </div>
            </div>
        </div>
    )
}