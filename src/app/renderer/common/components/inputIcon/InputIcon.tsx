import React from "react";
import styles from "./InputIcon.scss";

import emailImg from "../../../../../assets/icons/email.png";
import javaImg from "../../../../../assets/icons/java.png";
import passwordImg from "../../../../../assets/icons/password.png";

type IProps = {
    type: "email" | "text" | "password";
    icon: "email" | "java" | "password";
    onChange: (value: string) => void;
    className?: string;
    value?: string;
}
export default function InputIcon(props: IProps) {
    return (
        <div className={`${styles.inputIconDiv} ${props.className}`}>
            <GetIcon iconType={props.icon} />
            <input type={props.type} value={props.value !== undefined ? props.value : ""} onChange={(event) => props.onChange(event.target.value)} />
        </div>
    );
}

function GetIcon(props: { iconType: "email" | "java" | "password" }) {

    switch (props.iconType) {
        case "email":
            return (
                <img className={styles.icon} src={emailImg} alt="email" />
            );
        case "java":
            return (
                <img className={styles.icon} src={javaImg} alt="java" />
            );
        case "password":
            return (
                <img className={styles.icon} src={passwordImg} alt="password" />
            );
    }

}