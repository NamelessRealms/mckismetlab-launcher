import React from "react";
import styles from "./ButtonFocus.scss";

type IProps = {
    content: string | number;
    disabled?: boolean;
    className?: string;
    onClick?: () => void;
}

export default function ButtonFocus(props: IProps) {

    return (
        <div className={`${styles.buttonFocusDiv} ${props.className}`}>
            <button
                style={ props.disabled !== undefined ? props.disabled ? { cursor: "not-allowed" } : { cursor: "pointer" } : { cursor: "pointer" } }
                onClick={() => {if (props.onClick !== undefined && (props.disabled !== undefined ? !props.disabled : true)) props.onClick()}}
            >{props.content}</button>
        </div>
    );
}