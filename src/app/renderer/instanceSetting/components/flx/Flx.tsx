import React from "react";
import { useHistory } from "react-router-dom";
import ButtonFocus from "../../../common/components/buttonFocus/ButtonFocus";
import ProgressBar from "../../../common/components/progressBar/ProgressBar";
import SelectFlx from "./components/selectFlx/SelectFlx";
import styles from "./Flx.scss";

type IProps = {
    serverId: string;
}

export default function Flx(props: IProps) {

    const [flxType, setFlxType] = React.useState<"simple" | "deep" | undefined>(getGameDataFlxType(props.serverId));
    const [bigPercentage, setBigPercentage] = React.useState<number>(0);
    const [percentage, setPercentage] = React.useState<number>(0);
    const [percentageBigText, setPercentageBigText] = React.useState<string>("");
    const [percentageColor, setPercentageColor] = React.useState<string>("#3183E1");
    const [buttonDisabled, setButtonDisabled] = React.useState<boolean>(false);
    const history = useHistory();

    React.useEffect(() => {

        let cancel = false;

        if (flxType !== undefined) {
            gameDataFlxStart(props.serverId, flxType, history, (percentageData) => {
                if (cancel) return;
                setBigPercentage(percentageData.bigPercentage);
                setPercentage(percentageData.percentage);
                setPercentageBigText(percentageData.progressBarText);
                setPercentageColor(percentageData.color);
            });
        }

        return () => {
            cancel = true;
        }

    }, [flxType]);

    return (
        <div className={styles.flxDiv}>

            {
                flxType === undefined
                    ?
                    <SelectFlx serverId={props.serverId} onFlxTypeClick={setFlxType} />
                    :
                    <div className={styles.flxContextDiv}>

                        <div className={styles.flxTopDiv}>

                            <div className={styles.flxLeftDiv}>
                                <h1 className={styles.flxTitle}>{flxType === "simple" ? "簡單修復" : "深層修復"}</h1>
                            </div>

                            <div className={styles.flxRightDiv}>
                                <ButtonFocus className={`${styles.flxButtonFocus} ${styles.flxButtonFocusStop}`} content="停止修復" disabled={buttonDisabled} onClick={() => {

                                    window.electron.game.instance.flx.stop(props.serverId);
                                    setButtonDisabled(true);
                                    setBigPercentage(100);
                                    setPercentage(100);
                                    setPercentageBigText("修復停止中...");
                                    setPercentageColor("#ED4245");

                                }} />
                                <ButtonFocus className={styles.flxButtonFocus} content="導出Logs(.txt)" disabled={buttonDisabled} />
                            </div>

                        </div>

                        <div className={styles.flxProgressBarDiv}>

                            <div className={styles.flxProgressBarContextDiv}>
                                <h1 className={styles.flxProgressBarTitle}>整體進度</h1>
                                <ProgressBar className={styles.flxProgressBar} percentage={bigPercentage} color={percentageColor} />
                            </div>

                            <div className={styles.flxProgressBarContextDiv}>
                                <h1 className={styles.flxProgressBarTitle}>進度</h1>
                                <ProgressBar className={styles.flxProgressBar} percentage={percentage} color={percentageColor} />
                            </div>

                        </div>

                        <div className={styles.flxProgressBarTextDiv}>
                            <h1 className={styles.flxProgressBarText}>{percentageBigText}</h1>
                        </div>

                        <div className={styles.flxLogsDiv}>

                            <div className={styles.flxLogToolsDiv}>
                                <h1 className={styles.flxLogTitle}>修復Log</h1>
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

function gameDataFlxStart(serverId: string, flxType: "simple" | "deep", history: any, callback: (percentageData: { bigPercentage: number; percentage: number; progressBarText: string; color: string; }) => void) {

    const instance = window.electron.game.instance.flx;

    let state = instance.start(serverId, "settingPage", (code) => {

        switch (code) {
            case 0:
                instance.delete(serverId);
                callback({ bigPercentage: 100, percentage: 100, progressBarText: "修復已完成，嘗試開啟遊戲看有沒有解決你的問題", color: "#3183E1" });
                break;
            case 2:
                instance.delete(serverId);
                history.push(`/instanceSetting/${serverId}/5`);
                break;
        }

    }, flxType);

    if (state === "onStandby" || state === "validateFlx") {
        const percentageData = instance.progress.getPercentageData(serverId);
        if (percentageData !== null) callback({ bigPercentage: percentageData.bigPercentage, percentage: percentageData.percentage, progressBarText: percentageData.progressBarText, color: "#3183E1" });
        instance.progress.progressManagerEvent(serverId, (progressBarChange) => {
            if (instance.getProcessStopState(serverId)) {
                callback({ bigPercentage: progressBarChange.bigPercentage, percentage: progressBarChange.percentage, progressBarText: progressBarChange.progressBarText, color: "#3183E1" });
            }
        });
        return;
    }
}