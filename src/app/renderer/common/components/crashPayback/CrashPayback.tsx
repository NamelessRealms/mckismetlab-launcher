import React from "react";
import ButtonFocus from "../buttonFocus/ButtonFocus";
import Checkbox from "../checkbox/Checkbox";
import styles from "./CrashPayback.scss";

type IProps = {
    type: "minecraft" | "launcher";
    description: string;
    onCloseClick?: () => void;
}

export default function CrashPayback(props: IProps) {

    const [pageType, setPageType] = React.useState<number>(0);
    const [checked, setChecked] = React.useState<boolean>(false);
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
                                props.type === "minecraft" ? "糟糕了！遊戲崩潰了 :(" : "糟糕了！遊戲啟動崩潰了 :("
                            }
                        </h1>

                        {/* <h1 className={styles.textTitle}>error log</h1> */}
                        <div className={styles.textDiv}>
                            <h1 className={styles.description}>{props.description}</h1>
                        </div>

                        <div className={styles.buttonDiv}>
                            <ButtonFocus className={`${styles.buttonFocus} ${styles.buttonFocusRed}`} content="不要回報錯誤" onClick={() => {
                                if (props.onCloseClick === undefined) return;
                                props.onCloseClick();
                            }} />
                            <ButtonFocus className={styles.buttonFocus} content="我要回報錯誤" onClick={() => setPageType(1)} />
                        </div>

                    </div>
                    : null
            }

            {
                pageType === 1
                    ?
                    <div className={styles.issueSendDiv}>

                        <h1 className={styles.titleDiv}>隱私權</h1>
                        <div className={styles.textDiv}>
                            <div className={styles.issueDescription}>
                                <h1>為什麼 mcKismetLab 要收集有關錯誤的資料、紀錄?</h1>
                                <h2>我們將收集你使用啟動器的使用紀錄資料傳送給 mcKismetLab，該信息可幫助開發人員診斷你遇到什麼問題，當解決方案出來時，將在下一次更新釋出解決方案。</h2>
                                <h1>我們收集哪些類型的信息?</h1>
                                <h2>啟動器所有紀錄檔案。還會收集你的操作系統版本以及啟動器設置等資料。</h2>
                                <h1>安全問題?</h1>
                                <h2>我們不會收集你的帳號資料傳送給 mcKismetLab，請放心使用。</h2>
                            </div>
                        </div>

                        <div className={styles.buttonDiv}>
                            <div className={styles.checkboxDiv}>
                                <Checkbox className={styles.checkbox} checked={checked} onClickChecked={setChecked} content="我了解以上內容" />
                            </div>
                            <div className={styles.buttonContextDiv}>
                                <ButtonFocus className={`${styles.buttonFocus} ${styles.buttonFocusRed}`} content="取消" onClick={() => {
                                    if (props.onCloseClick === undefined) return;
                                    props.onCloseClick();
                                }} />
                                <ButtonFocus className={styles.buttonFocus} content="繼續" onClick={() => setPageType(2)} />
                            </div>
                        </div>
                    </div>
                    : null
            }

            {
                pageType === 2
                    ?
                    <div className={styles.formDiv}>

                        <h1 className={styles.title}>如果可以，請列出你出錯的步驟(選填)</h1>

                        <textarea
                            value={textareaContext}
                            onChange={(event) => setTextareaContext(event.target.value)}
                            placeholder="1. 點擊 '....'&#13;&#10;2. .......&#13;&#10;3. .....&#13;&#10;4. ...."
                        ></textarea>

                        <div className={styles.buttonDiv}>
                            <div className={styles.userDiv}>
                                <h1 className={styles.playerName}>ID: QuasiMkl</h1>
                            </div>
                            <div className={styles.buttonContextDiv}>
                                <ButtonFocus className={`${styles.buttonFocus} ${styles.buttonFocusRed}`} content="取消" onClick={() => {
                                    if (props.onCloseClick === undefined) return;
                                    props.onCloseClick();
                                }} />
                                <ButtonFocus className={styles.buttonFocus} content="傳送" onClick={() => setPageType(2)} />
                            </div>
                        </div>

                    </div>
                    : null
            }

        </div>
    )
}