import React from "react"; import Checkbox from "../../../checkbox/Checkbox";
import InputIcon from "../../../inputIcon/InputIcon";
import Toggle from "../../../toggle/Toggle";
import styles from "./JavaPath.scss";

import { useTranslation } from "react-i18next";

type IProps = {
    type: "instanceSetting" | "setting";
    checked?: boolean;
    value: string;
    toggle: boolean;
    pathChecking: boolean | undefined;
    onChangeJavaToggle?: (state: boolean) => void;
    onChangeJavaPath?: (value: string) => void;
    onChecked?: (state: boolean) => void;
    onClickAutoSearch?: () => void;
    onClickTest?: () => void;
    onClickManualSearched?: (path: string) => void;
}

export default function JavaPath(props: IProps) {

    const { t } = useTranslation();
    const [toggleInputPathDisabledDiv, setToggleInputPathDisabledDiv] = React.useState(props.toggle);
    const hiddenFileInput = React.useRef<any>(null);

    const handleClick = () => {
        hiddenFileInput.current.click();
    };

    const handleChange = (event: any) => {
        const fileUploaded = event.target.files[0];
        if (props.onClickManualSearched === undefined) return;
        props.onClickManualSearched(fileUploaded.path);
    };

    return (
        <div className={styles.javaPathDiv}>

            {
                props.type === "instanceSetting" ? props.checked || false ? null : <div className={styles.disabledDiv}></div> : null
            }

            {
                props.type === "setting"
                    ?
                    <h1>{t("common.components.parameters.javaPath.type.setting.text")}</h1>
                    :
                    <div className={styles.titleDiv}>

                        <Checkbox content={t("common.components.parameters.javaPath.type.instanceSetting.checkbox.text")} className={styles.checkbox} checked={props.type === "instanceSetting" ? props.checked || false : false} onClickChecked={(state) => {

                            if (props.onChecked === undefined) return;
                            props.onChecked(state);

                        }} />
                        {
                            props.type === "instanceSetting" ? props.checked ? null : <h1>{t("common.components.parameters.javaPath.type.instanceSetting.text")}</h1> : null
                        }

                    </div>
            }

            <div className={styles.toggleBuiltInJavaDiv}>
                <div className={styles.leftDiv}>
                    <h1>{t("common.components.parameters.javaPath.toggleBuiltInJava.title")}</h1>
                    {/* {
                        window.electron.os.type() === "osx" ? <h2>MacOS不適用這項功能</h2> : null
                    } */}
                </div>
                <div className={styles.rightDiv}>
                    <Toggle className={styles.toggle} state={props.toggle} onChange={(state) => {

                        setToggleInputPathDisabledDiv(state);
                        if (props.onChangeJavaToggle === undefined) return;
                        props.onChangeJavaToggle(state);

                    }} />
                </div>
            </div>

            {
                toggleInputPathDisabledDiv ? <div className={styles.toggleInputPathDisabledDiv}></div> : null
            }

            <InputIcon className={styles.inputIcon} type="text" icon="java" value={props.value} onChange={(value) => {

                if (props.onChangeJavaPath === undefined) return;
                props.onChangeJavaPath(value);

            }} />

            <div className={styles.stateButtonDiv}>

                <div className={styles.leftDiv}>
                    <h1>狀態:</h1>
                    {
                        props.pathChecking !== undefined ? props.pathChecking ? <h1>{t("common.components.parameters.javaPath.stateButtons.state.text_1")}</h1> : <h1>{t("common.components.parameters.javaPath.stateButtons.state.text_2")}</h1> : <h1>{t("common.components.parameters.javaPath.stateButtons.state.text_3")}</h1>
                    }
                </div>
                <div className={styles.rightDiv}>

                    <button className={styles.testButton} onClick={() => {

                        if (props.onClickTest === undefined) return;
                        props.onClickTest();

                    }}>{t("common.components.parameters.javaPath.stateButtons.buttons.button_1.text")}</button>
                    <button onClick={() => {

                        if (props.onClickAutoSearch === undefined) return;
                        props.onClickAutoSearch();

                    }}>{t("common.components.parameters.javaPath.stateButtons.buttons.button_2.text")}</button>
                    <button onClick={handleClick}>
                        <input type="file" ref={hiddenFileInput} onChange={(event) => {
                            handleChange(event);
                            event.target.value = "";
                        }} style={{ display: "none" }} />
                        {t("common.components.parameters.javaPath.stateButtons.buttons.button_3.text")}
                    </button>

                </div>

            </div>
        </div>
    );
}