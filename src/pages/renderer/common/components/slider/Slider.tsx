import React from "react";
import styles from "./Slider.scss";

type IProps = {
    max: number;
    min: number;
    value: number;
    onChange?: (value: number) => void;
}

export default function Slider(props: IProps) {

    return (
        <div className={styles.sliderDiv}>
            <input type="range" min={props.min} max={props.max} step="1" value={props.value} onChange={(event) => {

                if(props.onChange === undefined) return;
                props.onChange(Number(event.target.value));

            }} />
        </div>
    )
}