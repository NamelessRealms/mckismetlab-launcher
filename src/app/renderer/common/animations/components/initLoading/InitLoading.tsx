import React from "react";
import styles from "./InitLoading.scss";
import mklLogoImg from "../../../../../../assets/images/logo/logo.png";

import { animated, useTrail, config } from "react-spring";

type IProps = {
    text?: string;
}

export default function InitLoading(props: IProps) {

    const titleTexts = "mcKismetLab".split("");
    const [open, setOpen] = React.useState(true);

    const trail = useTrail(titleTexts.length + 1, {
        config: config.gentle,
        opacity: open ? 1 : 0.2,
        x: open ? 0 : 10,
        scale: open ? 1.2 : 1,
        from: {
            opacity: 0.2,
            x: 10,
            scale: 1.2
        }
    });

    React.useEffect(() => {

        let isCancelled = false;

        setTimeout(() => {
            if(!isCancelled) setOpen((value) => !value);
        }, 1800);

        return () => {
            isCancelled = true;
        };
    }, []);

    return (
        <div className={styles.initLoadingDiv}>
            <div className={styles.loadingTitleDiv}>
                <img src={mklLogoImg} alt="mckismetlab" />
                {
                    trail.map(({ ...style }, index) => (
                        <animated.div
                            key={index}
                            style={style}
                        >
                            <span>{titleTexts[index]}</span>
                        </animated.div>
                    ))
                }
            </div>
            <h1>{props.text}</h1>
        </div>
    );
}