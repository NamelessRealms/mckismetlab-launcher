import React from "react";
import Checkbox from "../../../checkbox/Checkbox";
import styles from "./JavaParameter.scss";

type IProps = {
    type: "instanceSetting" | "setting";
    checked?: boolean;
    value: string;
    onChangeJavaParameter?: (value: string) => void;
    onChecked?: (state: boolean) => void;
}

export default function JavaParameter(props: IProps) {

    return (
        <div className={styles.JavaParameterDiv}>

            {
                props.type === "instanceSetting" ? props.checked || false ? null : <div className={styles.disabledDiv}></div> : null
            }
            {
                props.type === "setting" ? <h1>參數</h1> : <div className={styles.titleDiv}>

                    <Checkbox content="參數" className={styles.checkbox} checked={props.type === "instanceSetting" ? props.checked || false : false} onClickChecked={(state) => {

                        if (props.onChecked === undefined) return;
                        props.onChecked(state);

                    }} />
                    {
                        props.type === "instanceSetting" ? props.checked ? null : <h1>(使用全域設定)</h1> : null
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