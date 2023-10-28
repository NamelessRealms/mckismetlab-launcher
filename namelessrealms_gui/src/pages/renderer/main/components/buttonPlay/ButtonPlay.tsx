import React from "react";
import styles from "./ButtonPlay.scss";
import playImg from "../../../../../assets/icons/play.png";
import stopImg from "../../../../../assets/icons/stop.png";
import supportImg from "../../../../../assets/icons/support.png";

import { useHistory } from "react-router-dom";
import { useTranslation, TFunction } from "react-i18next";

type IPlayState = "onStandby" | "validate" | "start" | "startError" | "close" | "closeError" | "validateFlx" | "stop" | "flxStop";
type IPlayButtonState = {
    progressBar: number;
    playState: IPlayState;
    playText: string;
    playColor: "#0a9850" | "#3183E1" | "#ED4245";
    playIconPadding: 15 | 30
}
type IProgressBar = {
    percentage: number;
}
type IProps = {
    serverId: string;
    onCrashClick?: (code: number, description: string) => void;
}

export default function ButtonPlay(props: IProps) {

    const { t } = useTranslation();
    const history = useHistory();
    const [playState, setPlayState] = React.useState<IPlayState>("onStandby");
    const [progressBar, setProgressBar] = React.useState(100);
    const [playText, setPlayText] = React.useState<string>("");
    const [playColor, setPlayColor] = React.useState<"#0a9850" | "#3183E1" | "#ED4245">("#0a9850");
    const [playPadding, setPlayIconPadding] = React.useState<15 | 30>(30);

    const setButton = (type: "setPlayButtonStates" | "setProgressBar", data: IPlayButtonState | IProgressBar) => {
        if (type === "setPlayButtonStates") {
            setPlayState((data as IPlayButtonState).playState);
            setPlayText((data as IPlayButtonState).playText);
            setPlayColor((data as IPlayButtonState).playColor);
            setPlayIconPadding((data as IPlayButtonState).playIconPadding);
            setProgressBar((data as IPlayButtonState).progressBar);
        } else if (type === "setProgressBar") {
            setProgressBar((data as IProgressBar).percentage);
        }
    }

    React.useEffect(() => {

        let cancel = false;

        gamePlayStart("React", props.serverId, history, t, (type, data) => {
            if (cancel) return;
            setButton(type, data);
        }, props.onCrashClick);

        return () => {
            cancel = true;
        }
    }, []);

    return (
        <div className={styles.buttonPlayDiv} style={{ padding: `0px ${playPadding}px` }} onClick={() => gamePlayStart("User", props.serverId, history, t, setButton, props.onCrashClick)}>

            <div className={styles.playButtonBackground} style={{ width: `${progressBar}%`, backgroundColor: playColor }}></div>
            <h1>{playText}</h1>
            {
                playState === "validateFlx" || playState === "flxStop"
                    ?
                    <img style={{ right: `${playPadding}px` }} src={supportImg} />
                    :
                    playState === "onStandby" ? <img style={{ right: `${playPadding}px` }} src={playImg} /> : <img style={{ right: `${playPadding}px` }} src={stopImg} />
            }

        </div>
    );
}

function gamePlayStart(userType: "React" | "User", serverId: string, history: any, t: TFunction<"translation">, callback: <T extends IPlayButtonState | IProgressBar>(type: "setPlayButtonStates" | "setProgressBar", data: T) => void, onCrashClick?: (code: number, description: string) => void) {

    const playButtonStates: Array<IPlayButtonState> = [
        {
            progressBar: 100,
            playState: "onStandby",
            playText: t("main.components.buttonPlay.playText_1"),
            playColor: "#0a9850",
            playIconPadding: 30
        },
        {
            progressBar: 0,
            playState: "validate",
            playText: t("main.components.buttonPlay.playText_2"),
            playColor: "#3183E1",
            playIconPadding: 15
        },
        {
            progressBar: 100,
            playState: "start",
            playText: t("main.components.buttonPlay.playText_3"),
            playColor: "#3183E1",
            playIconPadding: 15
        },
        {
            progressBar: 0,
            playState: "validateFlx",
            playText: t("main.components.buttonPlay.playText_4"),
            playColor: "#3183E1",
            playIconPadding: 15
        },
        {
            progressBar: 100,
            playState: "validateFlx",
            playText: t("main.components.buttonPlay.playText_5"),
            playColor: "#3183E1",
            playIconPadding: 15
        },
        {
            progressBar: 100,
            playState: "stop",
            playText: t("main.components.buttonPlay.playText_6"),
            playColor: "#ED4245",
            playIconPadding: 15
        },
        {
            progressBar: 100,
            playState: "flxStop",
            playText: t("main.components.buttonPlay.playText_7"),
            playColor: "#ED4245",
            playIconPadding: 15
        }
    ];

    const flxInstance = window.electron.game.instance.flx;
    let flxState = flxInstance.start(serverId, "mainPage", (code, description) => {
        switch (code) {
            case 0:
                flxInstance.delete(serverId);
                callback("setPlayButtonStates", playButtonStates[4]);
                break;
            case 2:
                flxInstance.delete(serverId);
                callback("setPlayButtonStates", playButtonStates[0]);
                break;
            case 1:
                flxInstance.delete(serverId);
                callback("setPlayButtonStates", playButtonStates[0]);
                if(onCrashClick !== undefined) onCrashClick(2, description);
                break;
        }
    });
    if (flxState === "validateFlx" || flxState === "stop") {
        callback("setPlayButtonStates", playButtonStates[3]);
        const percentageData = flxInstance.progress.getPercentageData(serverId);
        if (percentageData !== null) callback("setProgressBar", { percentage: percentageData.bigPercentage });
        flxInstance.progress.progressManagerEvent(serverId, (progressBarChange) => {
            callback("setProgressBar", { percentage: progressBarChange.bigPercentage });
        });
        if (userType === "User") history.push(`/instanceSetting/${serverId}/5`);
        return;
    }
    if ((flxState === "complete" || flxState === "error") && userType === "User") {
        flxInstance.delete(serverId);
        history.push(`/instanceSetting/${serverId}/5`);
        return;
    }


    const instance = window.electron.game.instance;
    let state = instance.start(serverId, userType, (code, description) => {

        switch (code) {
            case 0:
                callback("setPlayButtonStates", playButtonStates[2]);
                break;
            case 1:
                callback("setPlayButtonStates", playButtonStates[0]);
                break;
            case 2:
                callback("setPlayButtonStates", playButtonStates[0]);
                if(onCrashClick !== undefined) onCrashClick(0, description);
                break;
            case 3:
                callback("setPlayButtonStates", playButtonStates[0]);
                if(onCrashClick !== undefined) onCrashClick(1, description) 
                break;
            case 4:
                callback("setPlayButtonStates", playButtonStates[0]);
                break;
        }

    });

    if (state === "onStandby" && userType === "React") {
        callback("setPlayButtonStates", playButtonStates[0]);
        return;
    }

    if(state === "stop") {
        callback("setPlayButtonStates", playButtonStates[5]);
        return;
    }

    if (state === "onStandby" || state === "validate") {

        callback("setPlayButtonStates", playButtonStates[1]);
        const percentageData = instance.progress.getPercentageData(serverId);
        if (percentageData !== null) callback("setProgressBar", { percentage: percentageData.bigPercentage });
        instance.progress.progressManagerEvent(serverId, (progressBarChange) => {
            callback("setProgressBar", { percentage: progressBarChange.bigPercentage });
        });
        return;
    }

    if (state === "start") {
        callback("setPlayButtonStates", playButtonStates[2]);
        return;
    }
}