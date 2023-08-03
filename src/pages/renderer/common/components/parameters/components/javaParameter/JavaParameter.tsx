import React from "react";
import Checkbox from "../../../checkbox/Checkbox";
import styles from "./JavaParameter.scss";

import { useTranslation } from "react-i18next";

type IProps = {
    type: "instanceSetting" | "setting";
    checked?: boolean;
    value: string;
    onChangeJavaParameter?: (value: string) => void;
    onChecked?: (state: boolean) => void;
}

export default function JavaParameter(props: IProps) {

    const { t } = useTranslation();

    return (
        <div className={styles.JavaParameterDiv}>

            {
                props.type === "instanceSetting" ? props.checked || false ? null : <div className={styles.disabledDiv}></div> : null
            }
            {
                props.type === "setting"
                    ? <h1>{t("common.components.parameters.javaParameter.type.setting.text")}</h1>
                    :
                    <div className={styles.titleDiv}>

                        <Checkbox content={t("common.components.parameters.javaParameter.type.instanceSetting.checkbox.text")} className={styles.checkbox} checked={props.type === "instanceSetting" ? props.checked || false : false} onClickChecked={(state) => {

                            if (props.onChecked === undefined) return;
                            props.onChecked(state);

                        }} />
                        {
                            props.type === "instanceSetting" ? props.checked ? null : <h1>{t("common.components.parameters.javaParameter.type.instanceSetting.text")}</h1> : null
                        }

                    </div>
            }

            {/* <h1>參數</h1> */}
            <textarea value={props.value} onChange={(event) => {

                if (props.onChangeJavaParameter === undefined) return;
                props.onChangeJavaParameter(event.target.value);

            }}></textarea>

        </div>
    );
}