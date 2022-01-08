import React from "react";import InputIcon from "../../../../../common/components/inputIcon/InputIcon";
import Toggle from "../../../../../common/components/toggle/Toggle";
import styles from "./JavaPath.scss";

type IProps = {
    value: string;
    onChangeJavaPath?: (value: string) => void;
}

export default function JavaPath(props: IProps) {

    return (
        <div className={styles.javaPathDiv}>
            
            <h1>路徑</h1>

            <div className={styles.toggleBuiltInJavaDiv}>
                <div className={styles.leftDiv}>
                    <h1>使用內建 Java</h1>
                </div>
                <div className={styles.rightDiv}>
                    <Toggle className={styles.toggle} state={true} onChange={() => {}} />
                </div>
            </div>

            <InputIcon className={styles.inputIcon} type="text" icon="java" value={props.value} onChange={(value) => {

                if(props.onChangeJavaPath === undefined) return;
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