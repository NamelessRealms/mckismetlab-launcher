import React from "react";
import ButtonFocus from "../buttonFocus/ButtonFocus";
import Checkbox from "../checkbox/Checkbox";
import styles from "./CrashPayback.scss";

import { useTranslation } from "react-i18next";

type IProps = {
    type: "minecraft" | "launcher" | "flx";
    description: string;
    serverId?: string;
    onCloseClick?: () => void;
}

export default function CrashPayback(props: IProps) {

    const { t } = useTranslation();
    const [pageType, setPageType] = React.useState<number>(0);
    const [checked, setChecked] = React.useState<boolean>(false);
    const [checkedWarning, setCheckedWarning] = React.useState<boolean>(false);
    const [textareaContext, setTextareaContext] = React.useState<string>("");

    return (
        <div className={styles.crashPaybackDiv}>

            <div className={styles.backgroundDiv}></div>

            {
                pageType === 0
                    ?
                    <div className={styles.contextDiv}>

                        <h1 className={styles.titleDiv}>
                            {
                                props.type === "minecraft" ? t("common.components.crashPayback.title.title_minecraft") : props.type === "launcher" ? t("common.components.crashPayback.title.title_launcher") : t("common.components.crashPayback.title.title_flx")
                            }
                        </h1>

                        {/* <h1 className={styles.textTitle}>error log</h1> */}
                        <div className={styles.textDiv}>
                            <h1 className={styles.description}>{props.description}</h1>
                        </div>

                        <div className={styles.buttonDiv}>
                            <ButtonFocus className={`${styles.buttonFocus} ${styles.buttonFocusRed}`} content={t("common.components.crashPayback.buttons.button_1") as string} onClick={() => {
                                if (props.onCloseClick === undefined) return;
                                props.onCloseClick();
                            }} />
                            <ButtonFocus className={styles.buttonFocus} content={t("common.components.crashPayback.buttons.button_2") as string} onClick={() => setPageType(1)} />
                        </div>

                    </div>
                    : null
            }

            {
                pageType === 1
                    ?
                    <div className={styles.issueSendDiv}>

                        <h1 className={styles.titleDiv}>{t("common.components.crashPayback.issueSend.title")}</h1>
                        <div className={styles.textDiv}>
                            <div className={styles.issueDescription}>
                                <h1>{t("common.components.crashPayback.issueSend.issueDescription.text_1")}</h1>
                                <h2>{t("common.components.crashPayback.issueSend.issueDescription.description_1")}</h2>
                                <h1>{t("common.components.crashPayback.issueSend.issueDescription.text_2")}</h1>
                                <h2>{t("common.components.crashPayback.issueSend.issueDescription.description_2")}</h2>
                                <h1>{t("common.components.crashPayback.issueSend.issueDescription.text_3")}</h1>
                                <h2>{t("common.components.crashPayback.issueSend.issueDescription.description_3")}</h2>
                            </div>
                        </div>

                        <div className={styles.buttonDiv}>
                            <div className={styles.checkboxDiv}>
                                <Checkbox className={`${styles.checkbox} ${checkedWarning ? styles.checkedWarning : null}`} checked={checked} onClickChecked={setChecked} content={t("common.components.crashPayback.issueSend.checkbox.title")} />
                            </div>
                            <div className={styles.buttonContextDiv}>
                                <ButtonFocus className={`${styles.buttonFocus} ${styles.buttonFocusRed}`} content={t("common.components.crashPayback.buttons.button_3") as string} onClick={() => {
                                    if (props.onCloseClick === undefined) return;
                                    props.onCloseClick();
                                }} />
                                <ButtonFocus className={styles.buttonFocus} content={t("common.components.crashPayback.buttons.button_4") as string} onClick={() => {

                                    if(checked) {
                                        setPageType(2);
                                    } else {
                                        if(checkedWarning) {
                                            setCheckedWarning(false);
                                            setTimeout(() => setCheckedWarning(true), 1);
                                        } else {
                                            setCheckedWarning(true);
                                        }
                                    }

                                }} />
                            </div>
                        </div>
                    </div>
                    : null
            }

            {
                pageType === 2
                    ?
                    <div className={styles.formDiv}>

                        <h1 className={styles.title}>{t("common.components.crashPayback.form.title")}</h1>

                        <textarea
                            value={textareaContext}
                            onChange={(event) => setTextareaContext(event.target.value)}
                            placeholder="1. Click '....'&#13;&#10;2. .......&#13;&#10;3. .....&#13;&#10;4. ...."
                        ></textarea>

                        <div className={styles.buttonDiv}>
                            <div className={styles.userDiv}>
                                <h1 className={styles.playerName}>ID: {window.electron.io.player.getPlayerName()}</h1>
                            </div>
                            <div className={styles.buttonContextDiv}>
                                <ButtonFocus className={`${styles.buttonFocus} ${styles.buttonFocusRed}`} content={t("common.components.crashPayback.buttons.button_5") as string} onClick={() => {
                                    if (props.onCloseClick === undefined) return;
                                    props.onCloseClick();
                                }} />
                                <ButtonFocus className={styles.buttonFocus} content={t("common.components.crashPayback.buttons.button_6") as string} onClick={() => {
                                    window.electron.send.error(textareaContext, props.type === "flx" || props.type === "launcher" ? "Launcher" : "Minecraft", props.serverId);
                                    if (props.onCloseClick === undefined) return;
                                    props.onCloseClick();
                                }} />
                            </div>
                        </div>

                    </div>
                    : null
            }

        </div>
    )
}