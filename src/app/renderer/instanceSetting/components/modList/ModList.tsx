import React from "react";
import ButtonFocus from "../../../common/components/buttonFocus/ButtonFocus";
import Checkbox from "../../../common/components/checkbox/Checkbox";
import InputIcon from "../../../common/components/inputIcon/InputIcon";
import Toggle from "../../../common/components/toggle/Toggle";
import styles from "./ModList.scss";
import deleteForeverIcon from "../../../../../assets/icons/delete-forever.png";

export default function ModList() {

    const [searchValue, setSearchValue] = React.useState("");
    const [mods, setMods] = React.useState([
        {
            name: "Sodium",
            state: true
        },
        {
            name: "Iris Shaders",
            state: true
        },
        {
            name: "Hydrogen",
            state: true
        },
        {
            name: "Lithium",
            state: true
        },
        {
            name: "LazyDFU",
            state: true
        }
    ]);

    return (
        <div className={styles.modListDiv}>

            <div className={styles.searchButtonDiv}>

                <InputIcon className={styles.inputIcon} type="text" icon="email" value={searchValue} onChange={setSearchValue} />
                <ButtonFocus content="新增模組" className={styles.buttonFocus} />

            </div>

            <div className={styles.textFilterDiv}>

                <div className={styles.leftDiv}>
                    <h1>狀態</h1>
                    <h2>名稱</h2>
                </div>

                <div className={styles.rightDiv}>
                    <h1>條件篩選</h1>
                    <Checkbox className={styles.checkbox} content="啟用" checked={true} />
                    <Checkbox className={styles.checkbox} content="停用" checked={true} />
                </div>

            </div>

            <div className={styles.listDiv}>

                {
                    mods.map((item) => (
                        <div key={window.electron.uuid.getUUIDv4()} className={styles.itemDiv}>

                            <div className={styles.leftDiv}>
                                <div className={styles.outerCircle}>
                                    {
                                        item.state ? <div className={styles.innerCircle}></div> : null
                                    }
                                </div>
                                <h1>{item.name}</h1>
                            </div>

                            <div className={styles.rightDiv}>
                                    <Toggle className={styles.toggle} state={true} onChange={() => {}} />
                                    <img src={deleteForeverIcon} alt="delete-forever" />
                            </div>

                        </div>
                    ))
                }

            </div>

        </div>
    );
}