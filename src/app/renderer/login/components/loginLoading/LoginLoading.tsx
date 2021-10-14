import React from "react";
import styles from "./LoginLoading.scss";

import { animated, useTrail } from "react-spring"
import { useTranslation } from "react-i18next";
export default function LoginLoading() {

    const { t } = useTranslation();

    const [open, setOpen] = React.useState(true);

    const trail = useTrail(3, {
        config: {
            mass: 5,
            tension: 2000,
            friction: 200
        },
        opacity: open ? 1 : 0,
        y: open ? 0 : 30,
        from: {
            opacity: 0,
            y: 30
        }
    });

    setTimeout(() => setOpen((value) => !value), 500);

    return (
        <div className={styles.loginLoadingDiv}>

            <h1>{t("login.loadingText")}</h1>

            <div className={styles.circlesDiv}>

                {
                    trail.map(({ ...style }, index) => (
                        <animated.div
                            key={index}
                            style={style}

                        >
                            <div className={styles.circle}></div>
                        </animated.div>
                    ))
                }

            </div>
        </div>
    );
}