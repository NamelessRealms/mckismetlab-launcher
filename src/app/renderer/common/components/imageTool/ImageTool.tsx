import React from "react";
import styles from "./imageTool.scss";
import deleteForeverRedIcon from "../../../../../assets/icons/delete-forever-red.png";

type IProps = {
    title: string;
}

export default function ImageTool(props: IProps) {

    return (
        <div className={styles.imageToolDiv}>

            <div className={styles.serverBorderDiv}>

                <div className={styles.toolsDiv}>
                    <div className={styles.toolsContainerDiv}>
                        <div className={styles.iconDiv}>
                            <img src={deleteForeverRedIcon} alt="deleteForeverRedIcon" />
                        </div>
                    </div>
                </div>

                <div className={styles.topDiv}>
                    
                </div>

                <div className={styles.bottomDiv}>
                    <h1>{props.title}</h1>
                </div>

            </div>

        </div>
    );
}