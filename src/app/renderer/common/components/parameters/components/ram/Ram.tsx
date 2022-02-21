import React from "react";
import Checkbox from "../../../checkbox/Checkbox";
import Slider from "../../../slider/Slider";
import styles from "./Ram.scss";

import { useTranslation } from "react-i18next";

type IProps = {
    type: "instanceSetting" | "setting";
    ramChecked?: boolean;
    ramMax: number,
    ramMin: number
    onRamMaxChange?: (value: number) => void;
    onRamMinChange?: (value: number) => void;
    onRamChecked?: (state: boolean) => void;
}

export default function Ram(props: IProps) {

    const { t } = useTranslation();

    const setRamMax = (value: number) => {
        if (props.onRamMaxChange === undefined) return;
        props.onRamMaxChange(value);
    }

    const setRamMin = (value: number) => {
        if (props.onRamMinChange === undefined) return;
        props.onRamMinChange(value);
    }

    const ramTotal = window.electron.os.ram.getTotal();
    const ramFree = window.electron.os.ram.getFree();

    return (
        <div className={styles.ramDiv}>
            {
                props.type === "instanceSetting" ? props.ramChecked || false ? null : <div className={styles.disabledDiv}></div> : null
            }
            {
                props.type === "setting" ? <h1>{t("common.components.parameters.ram.type.setting.text")}</h1> : <div className={styles.titleDiv}>

                    <Checkbox content={t("common.components.parameters.ram.type.instanceSetting.checkbox.text")} checked={props.type === "instanceSetting" ? props.ramChecked || false : false} onClickChecked={(state) => {

                        if(props.onRamChecked === undefined) return;
                        props.onRamChecked(state);

                    }} />
                    {
                        props.type === "instanceSetting" ?  props.ramChecked ? null : <h1>{t("common.components.parameters.ram.type.instanceSetting.text")}</h1> : null
                    }

                </div>
            }
            <div className={styles.ramContainerDiv}>

                <div className={styles.leftDiv}>
                    <div className={styles.ramMaxInputDiv}>
                        <h1>{t("common.components.parameters.ram.input.ramMax.text")}</h1>
                        <input type="number" value={props.ramMax} onChange={(event) => setRamMax(Number(event.target.value))} />
                        <h2>GB</h2>
                    </div>
                    <Slider min={1} max={ramTotal} value={props.ramMax} onChange={setRamMax} />
                    <div className={styles.ramMinInputDiv}>
                        <h1>{t("common.components.parameters.ram.input.ramMin.text")}</h1>
                        <input type="number" value={props.ramMin} onChange={(event) => setRamMin(Number(event.target.value))} />
                        <h2>GB</h2>
                    </div>
                    <Slider min={1} max={ramTotal} value={props.ramMin} onChange={setRamMin} />
                </div>

                <div className={styles.rightDiv}>
                    <div className={styles.ramNumberContainerDiv}>
                        <h1>{t("common.components.parameters.ram.ramFree.text")}</h1>
                        <div className={styles.tr}></div>
                        <div className={styles.ramNumberDiv}>
                            <h1>{ramFree}</h1>
                            <h2>GB</h2>
                        </div>
                    </div>
                    <div className={styles.ramNumberContainerDiv}>
                        <h1>{t("common.components.parameters.ram.ramTotal.text")}</h1>
                        <div className={styles.tr}></div>
                        <div className={styles.ramNumberDiv}>
                            <h1>{ramTotal}</h1>
                            <h2>GB</h2>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}