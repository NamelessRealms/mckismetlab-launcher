import React from "react";
import Slider from "../../../../../../common/components/slider/Slider";
import styles from "./Ram.scss";

type IProps = {
    ramMax: number,
    ramMin: number
    onRamMaxChange?: (value: number) => void;
    onRamMinChange?: (value: number) => void;
}

export default function Ram(props: IProps) {

    const setRamMax = (value: number) => {
        if (props.onRamMaxChange === undefined) return;
        props.onRamMaxChange(value);
    }

    const setRamMin = (value: number) => {
        if (props.onRamMinChange === undefined) return;
        props.onRamMinChange(value);
    }

    return (
        <div className={styles.ramDiv}>
            <h1>記憶體</h1>
            <div className={styles.ramContainerDiv}>

                <div className={styles.leftDiv}>
                    <div className={styles.ramMaxInputDiv}>
                        <h1>最⼤記憶體使⽤量:</h1>
                        <input type="number" value={props.ramMax} onChange={(event) => setRamMax(Number(event.target.value))} />
                        <h2>GB</h2>
                    </div>
                    <Slider min={1} max={16} value={props.ramMax} onChange={setRamMax} />
                    <div className={styles.ramMinInputDiv}>
                        <h1>最小記憶體使⽤量:</h1>
                        <input type="number" value={props.ramMin} onChange={(event) => setRamMin(Number(event.target.value))} />
                        <h2>GB</h2>
                    </div>
                    <Slider min={1} max={16} value={props.ramMin} onChange={setRamMin} />
                </div>

                <div className={styles.rightDiv}>
                    <div className={styles.ramNumberContainerDiv}>
                        <h1>可用記憶體</h1>
                        <div className={styles.tr}></div>
                        <div className={styles.ramNumberDiv}>
                            <h1>10</h1>
                            <h2>GB</h2>
                        </div>
                    </div>
                    <div className={styles.ramNumberContainerDiv}>
                        <h1>總共記憶體</h1>
                        <div className={styles.tr}></div>
                        <div className={styles.ramNumberDiv}>
                            <h1>16</h1>
                            <h2>GB</h2>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}