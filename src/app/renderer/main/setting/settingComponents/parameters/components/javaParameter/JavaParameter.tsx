import React from "react";
import styles from "./JavaParameter.scss";

type IProps = {
    value: string;
    onChangeJavaParameter?: (value: string) => void;
}

export default function JavaParameter(props: IProps) {
    
    return (
        <div className={styles.JavaParameterDiv}>

            <h1>參數</h1>
            <textarea value={props.value} onChange={(event) => {

                if(props.onChangeJavaParameter === undefined) return;
                props.onChangeJavaParameter(event.target.value);

            }}></textarea>

        </div>
    );
}