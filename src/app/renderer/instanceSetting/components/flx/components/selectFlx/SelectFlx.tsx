import React from "react";
import styles from "./SelectFlx.scss";
import spannerImg from "../../../../../../../assets/icons/spanner.png";
import supportImg from "../../../../../../../assets/icons/support.png";
import AlertConfirm from "../../../../../common/components/alertConfirm/AlertConfirm";
import GameUtils from "../../../../../../common/game/GameUtils";

interface IFlxSelectsItem {
    id: "simple" | "deep",
    typeTitle: string;
    description: string;
    imgSrc: any;
}

type IProps = {
    serverId: string;
    onFlxTypeClick?: (flxType: "simple" | "deep") => void;
}

export default function SelectFlx(props: IProps) {

    const selects: Array<IFlxSelectsItem> = [
        {
            id: "simple",
            typeTitle: "簡單修復",
            description: "速度較快，但修復後可能幫不上忙",
            imgSrc: spannerImg
        },
        {
            id: "deep",
            typeTitle: "深層修復",
            description: "速度非常慢，修復後可能或許有些幫助",
            imgSrc: supportImg
        }
    ];

    const [disabledDiv, setDisabledDiv] = React.useState<boolean>(GameUtils.isGameStart(props.serverId));
    const [hiddenAlertConfirm, setHiddenAlertConfirm] = React.useState<boolean>(false);
    const [flxType, setFlxType] = React.useState<"simple" | "deep">();

    return (
        <div className={styles.selectFlxDiv}>

            {
                disabledDiv
                    ?
                    <div className={styles.disabledDiv}>
                        <div className={styles.disabledBackgroundDiv}>
                            <h1 className={styles.disabledTitle}>無法使用修復，請先關閉遊戲</h1>
                        </div>
                    </div> : null
            }

            {
                hiddenAlertConfirm
                    ?
                    <AlertConfirm
                        title="注意!"
                        description="使用修復功能之前需注意這功能將會刪除檔案，這包括另外你自己加的材質包、光影、模組，有需要的話請先備份。"
                        onConfirmClick={() => {
                            if (props.onFlxTypeClick === undefined) return;
                            if (flxType === undefined) return;
                            props.onFlxTypeClick(flxType);
                        }}
                        onCancelClick={() => setHiddenAlertConfirm(false)}
                    /> : null
            }

            <h1 className={styles.selectFlxTitle}>選擇修復模式</h1>

            <div className={styles.flxModelSelectDiv}>

                {
                    selects.map((item) => (
                        <div key={window.electron.uuid.getUUIDv4()} className={styles.itemDiv} onClick={() => { setHiddenAlertConfirm(true); setFlxType(item.id); }}>
                            <img className={styles.modelImg} src={item.imgSrc} />
                            <h1 className={styles.modelTitle}>{item.typeTitle}</h1>
                            <p className={styles.modelDescription}>{item.description}</p>
                        </div>
                    ))
                }

            </div>

        </div>
    )
}