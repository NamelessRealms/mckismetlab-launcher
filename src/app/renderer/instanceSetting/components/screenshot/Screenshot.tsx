import React from "react";
import ButtonFocus from "../../../common/components/buttonFocus/ButtonFocus";
import ImageTool from "../../../common/components/imageTool/imageTool";
import styles from "./Screenshot.scss";

export default function Screenshot() {

    const [screenshots, setScreenshots] = React.useState([
        {
            fileName: "2021-09-21_15.11.44",
            name: "2021-09-21_15.11.44"
        }
    ]);

    return (
        <div className={styles.screenshotDiv}>

            <div className={styles.topDiv}>
                <ButtonFocus content="檢視資料夾" className={styles.buttonFocus} />
            </div>

            <div className={styles.listDiv}>
                {

                    screenshots.map((item) => (
                        <div key={window.electron.uuid.getUUIDv4()} className={styles.itemDiv}>
                            <ImageTool title={item.name} />
                        </div>
                    ))

                }
            </div>

        </div>
    );
}