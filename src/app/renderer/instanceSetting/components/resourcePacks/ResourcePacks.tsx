import React from "react";
import ButtonFocus from "../../../common/components/buttonFocus/ButtonFocus";
import styles from "./ResourcePacks.scss";
import deleteForeverRedIcon from "../../../../../assets/icons/delete-forever-red.png";
import ImageTool from "../../../common/components/imageTool/imageTool";

export default function ResourcePacks() {

    const [packs, setPacks] = React.useState([
        {
            fileName: "zh_tw-Lang-Pack-1.16v9",
            name: "zh_tw-lang"
        }
    ]);

    return (
        <div className={styles.resourcePacksDiv}>

            <div className={styles.topDiv}>
                <ButtonFocus content="檢視資料夾" className={styles.buttonFocus} />
            </div>

            <div className={styles.listDiv}>
                {

                    packs.map((item) => (
                        <div key={window.electron.uuid.getUUIDv4()} className={styles.itemDiv}>
                            <ImageTool title={item.name} />
                        </div>
                    ))

                }
            </div>

        </div>
    );
}