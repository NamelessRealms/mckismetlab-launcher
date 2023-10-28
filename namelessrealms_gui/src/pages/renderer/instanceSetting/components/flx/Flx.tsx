import React from "react";
import { useHistory } from "react-router-dom";
import ButtonFocus from "../../../common/components/buttonFocus/ButtonFocus";
import ProgressBar from "../../../common/components/progressBar/ProgressBar";
import SelectFlx from "./components/selectFlx/SelectFlx";
import styles from "./Flx.scss";

import { useTranslation, TFunction } from "react-i18next";
import CrashPayback from "../../../common/components/crashPayback/CrashPayback";

type IProps = {
    serverId: string;
}

export default function Flx(props: IProps) {

    const [catchType, setCatchType] = React.useState<"flx" | undefined>();
    const [catchDescription, setCatchDescription] = React.useState<string>("");

    const [flxType, setFlxType] = React.useState<"simple" | "deep" | undefined>(getGameDataFlxType(props.serverId));
    const [bigPercentage, setBigPercentage] = React.useState<number>(0);
    const [percentage, setPercentage] = React.useState<number>(0);
    const [percentageBigText, setPercentageBigText] = React.useState<string>("");
    const [percentageColor, setPercentageColor] = React.useState<string>("#3183E1");
    const [buttonDisabled, setButtonDisabled] = React.useState<boolean>(false);
    const history = useHistory();
    const { t } = useTranslation();

    React.useEffect(() => {

        let cancel = false;

        if (flxType !== undefined) {
            gameDataFlxStart(props.serverId, flxType, history, t, (percentageData) => {
                if (cancel) return;
                setButtonDisabled(percentageData.buttonDisabled);
                setBigPercentage(percentageData.bigPercentage);
                setPercentage(percentageData.percentage);
                setPercentageBigText(percentageData.progressBarText);
                setPercentageColor(percentageData.color);
            }, (description) => {
                setCatchDescription(description);
                setCatchType("flx");
            });
        }

        return () => {
            cancel = true;
        }

    }, [flxType]);

    return (
        <div className={styles.flxDiv}>

            {
                catchType !== undefined
                    ?
                    <CrashPayback
                        type={catchType}
                        onCloseClick={() => history.push(`/instanceSetting/${props.serverId}/5`)}
                        description={catchDescription}
                    /> : null
            }

            {
                flxType === undefined
                    ?
                    <SelectFlx serverId={props.serverId} onFlxTypeClick={setFlxType} />
                    :
                    <div className={styles.flxContextDiv}>

                        <div className={styles.flxTopDiv}>

                            <div className={styles.flxLeftDiv}>
                                <h1 className={styles.flxTitle}>{flxType === "simple" ? t("instanceSetting.components.flx.title.simple") : t("instanceSetting.components.flx.title.deep")}</h1>
                            </div>

                            <div className={styles.flxRightDiv}>
                                <ButtonFocus className={`${styles.flxButtonFocus} ${styles.flxButtonFocusStop}`} content="停止修復" disabled={buttonDisabled} onClick={() => {

                                    if(buttonDisabled) return;
                                    
                                    window.electron.game.instance.flx.stop(props.serverId);
                                    setButtonDisabled(true);
                                    setBigPercentage(100);
                                    setPercentage(100);
                                    setPercentageBigText(t("instanceSetting.components.flx.percentageBig.texts.text_1"));
                                    setPercentageColor("#ED4245");

                                }} />
                                <ButtonFocus className={styles.flxButtonFocus} content="導出Logs(.txt)" disabled={buttonDisabled} />
                            </div>

                        </div>

                        <div className={styles.flxProgressBarDiv}>

                            <div className={styles.flxProgressBarContextDiv}>
                                <h1 className={styles.flxProgressBarTitle}>{t("instanceSetting.components.flx.percentageBig.title_1")}</h1>
                                <ProgressBar className={styles.flxProgressBar} percentage={bigPercentage} color={percentageColor} />
                            </div>

                            <div className={styles.flxProgressBarContextDiv}>
                                <h1 className={styles.flxProgressBarTitle}>{t("instanceSetting.components.flx.percentageBig.title_2")}</h1>
                                <ProgressBar className={styles.flxProgressBar} percentage={percentage} color={percentageColor} />
                            </div>

                        </div>

                        <div className={styles.flxProgressBarTextDiv}>
                            <h1 className={styles.flxProgressBarText}>{percentageBigText}</h1>
                        </div>

                        <div className={styles.flxLogsDiv}>

                            <div className={styles.flxLogToolsDiv}>
                                <h1 className={styles.flxLogTitle}>{t("instanceSetting.components.flx.logs.title")}</h1>
                            </div>

                            <div className={styles.flxLogTextsDiv}>

                            </div>

                        </div>

                    </div>
            }

        </div>
    )
}

function getGameDataFlxType(serverId: string): "simple" | "deep" | undefined {
    return window.electron.game.instance.flx.getGameFlxFlxType(serverId);
}

function gameDataFlxStart(serverId: string, flxType: "simple" | "deep", history: any, t: TFunction<"translation">, callback: (percentageData: { buttonDisabled: boolean, bigPercentage: number; percentage: number; progressBarText: string; color: string; }) => void, callCrashClick?: (description: string) => void) {

    const instance = window.electron.game.instance.flx;

    let state = instance.start(serverId, "settingPage", (code, description) => {

        switch (code) {
            case 0:
                instance.delete(serverId);
                callback({ buttonDisabled: true, bigPercentage: 100, percentage: 100, progressBarText: t("instanceSetting.components.flx.percentageBig.texts.text_2"), color: "#3183E1" });
                break;
            case 2:
                instance.delete(serverId);
                history.push(`/instanceSetting/${serverId}/5`);
                break;
            case 1:
                instance.delete(serverId);
                if (callCrashClick !== undefined) callCrashClick(description);
                break;
        }

    }, flxType);;

    if (state === "stop") {
        callback({ buttonDisabled: true, bigPercentage: 100, percentage: 100, progressBarText: t("instanceSetting.components.flx.percentageBig.texts.text_1"), color: "#ED4245" });
        return;
    }

    if (state === "onStandby" || state === "validateFlx") {
        const percentageData = instance.progress.getPercentageData(serverId);
        if (percentageData !== null) callback({ buttonDisabled: false, bigPercentage: percentageData.bigPercentage, percentage: percentageData.percentage, progressBarText: percentageData.progressBarText, color: "#3183E1" });
        instance.progress.progressManagerEvent(serverId, (progressBarChange) => {
            if (instance.getProcessStopState(serverId)) {
                callback({ buttonDisabled: false, bigPercentage: progressBarChange.bigPercentage, percentage: progressBarChange.percentage, progressBarText: progressBarChange.progressBarText, color: "#3183E1" });
            }
        });
        return;
    }
}