import React from "react";
import styles from "./ButtonFocus.scss";

type IProps = {
    content: string | number;
    className?: string;
    onClick?: () => void;
}

export default function ButtonFocus(props: IProps) {

    return (
        <div className={`${styles.buttonFocusDiv} ${props.className}`}>
            <button onClick={() => {

                if(props.onClick === undefined) return;
                props.onClick();

            }}>{props.content}</button>
        </div>
    );
}