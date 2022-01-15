import React from "react";import Checkbox from "../../../checkbox/Checkbox";
 import InputIcon from "../../../inputIcon/InputIcon";
import Toggle from "../../../toggle/Toggle";
import styles from "./JavaPath.scss";

type IProps = {
    type: "instanceSetting" | "setting";
    checked?: boolean;
    value: string;
    toggle: boolean;
    onChangeJavaToggle?: (state: boolean) => void;
    onChangeJavaPath?: (value: string) => void;
    onChecked?: (state: boolean) => void;
}

export default function JavaPath(props: IProps) {

    return (
        <div className={styles.javaPathDiv}>

            {
                props.type === "instanceSetting" ? props.checked || false ? null : <div className={styles.disabledDiv}></div> : null
            }
            {
                props.type === "setting" ? <h1>路徑</h1> : <div className={styles.titleDiv}>

                    <Checkbox content="路徑" className={styles.checkbox} checked={props.type === "instanceSetting" ? props.checked || false : false} onClickChecked={(state) => {

                        if (props.onChecked === undefined) return;
                        props.onChecked(state);

                    }} />
                    {
                        props.type === "instanceSetting" ? props.checked ? null : <h1>(使用全域設定)</h1> : null
                    }

                </div>
            }

            <div className={styles.toggleBuiltInJavaDiv}>
                <div className={styles.leftDiv}>
                    <h1>使用內建 Java</h1>
                </div>
                <div className={styles.rightDiv}>
                    <Toggle className={styles.toggle} state={props.toggle} onChange={() => {

                        if(props.onChangeJavaToggle === undefined) return;
                        props.onChangeJavaToggle(!props.toggle);

                    }} />
                </div>
            </div>

            <InputIcon className={styles.inputIcon} type="text" icon="java" value={props.value} onChange={(value) => {

                if (props.onChangeJavaPath === undefined) return;
                props.onChangeJavaPath(value);

            }} />

            <div className={styles.stateButtonDiv}>

                <div className={styles.leftDiv}>
                    <h1>狀態:</h1>
                    <h1>可使用的路徑</h1>
                </div>
                <div className={styles.rightDiv}>

                    <button className={styles.testButton}>測試</button>
                    <button>自動尋找</button>
                    <button>手動尋找</button>

                </div>

            </div>
        </div>
    );
}