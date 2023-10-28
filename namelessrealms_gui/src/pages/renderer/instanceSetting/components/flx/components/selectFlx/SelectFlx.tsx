import React from "react";
import styles from "./SelectFlx.scss";
import spannerImg from "../../../../../../../assets/icons/spanner.png";
import supportImg from "../../../../../../../assets/icons/support.png";
import AlertConfirm from "../../../../../common/components/alertConfirm/AlertConfirm";
import GameUtils from "../../../../../../common/game/GameUtils";

import { useTranslation } from "react-i18next";

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

    const { t } = useTranslation();

    const selects: Array<IFlxSelectsItem> = [
        {
            id: "simple",
            typeTitle: t("instanceSetting.components.flx.selectFlx.selects.item_1.typeTitle"),
            description: t("instanceSetting.components.flx.selectFlx.selects.item_1.description"),
            imgSrc: spannerImg
        },
        {
            id: "deep",
            typeTitle: t("instanceSetting.components.flx.selectFlx.selects.item_2.typeTitle"),
            description: t("instanceSetting.components.flx.selectFlx.selects.item_2.description"),
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
                            <h1 className={styles.disabledTitle}>{t("instanceSetting.components.flx.selectFlx.disableSelect.title")}</h1>
                        </div>
                    </div> : null
            }

            {
                hiddenAlertConfirm
                    ?
                    <AlertConfirm
                        title={t("instanceSetting.components.flx.selectFlx.hiddenAlertConfirm.title")}
                        description={t("instanceSetting.components.flx.selectFlx.hiddenAlertConfirm.description")}
                        onConfirmClick={() => {
                            if (props.onFlxTypeClick === undefined) return;
                            if (flxType === undefined) return;
                            props.onFlxTypeClick(flxType);
                        }}
                        onCancelClick={() => setHiddenAlertConfirm(false)}
                    /> : null
            }

            <h1 className={styles.selectFlxTitle}>{t("instanceSetting.components.flx.selectFlx.title")}</h1>

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