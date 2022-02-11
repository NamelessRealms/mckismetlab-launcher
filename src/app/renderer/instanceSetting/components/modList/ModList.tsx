import React from "react";
import GameUtils from "../../../../common/game/GameUtils";
import AlertConfirm from "../../../common/components/alertConfirm/AlertConfirm";
import ButtonFocus from "../../../common/components/buttonFocus/ButtonFocus";
import Checkbox from "../../../common/components/checkbox/Checkbox";
import InputIcon from "../../../common/components/inputIcon/InputIcon";
import Mod from "./components/mod/Mod";
import styles from "./ModList.scss";

type IProps = {
    serverId: string;
}

export default function ModList(props: IProps) {

    const [disabledDiv, setDisabledDiv] = React.useState<boolean>(GameUtils.isGameStart(props.serverId));
    const [searchValue, setSearchValue] = React.useState("");
    const [enableCheckbox, setEnableCheckbox] = React.useState(true);
    const [disableCheckbox, setDisableCheckbox] = React.useState(true);
    const hiddenFileInput = React.useRef<any>(null);
    const [hiddenAlertConfirm, setHiddenAlertConfirm] = React.useState(false);
    const [mods, setMods] = React.useState<Array<{ fileName: string; filePath: string; state: boolean; hidden: boolean }>>();

    const [alertConfirmTitle, setAlertConfirmTitle] = React.useState("");
    const [alertConfirmDescription, setAlertConfirmDescription] = React.useState("");
    const [deleteFilePath, setDeleteFilePath] = React.useState("");

    React.useEffect(() => {
        const mods = window.electron.game.module.getModules(props.serverId);
        if (mods.length > 0) setMods(window.electron.game.module.getModules(props.serverId));
    }, []);

    const handleChange = (event: any) => {
        for (let file of event.target.files) {
            window.electron.game.module.copyModuleFile({ name: file.name, path: file.path }, props.serverId);
        }
        setMods(window.electron.game.module.getModules(props.serverId));
    };

    const search = (searchValue: string) => {

        if (mods === undefined) return;

        const modules = window.electron.game.module.getModules(props.serverId);

        if (search !== undefined && search.length !== 0) {
            for (let i = 0; i < modules.length; i++) {

                modules[i].hidden = true;

                if (modules[i].fileName.toLowerCase().indexOf(searchValue.toLowerCase()) === -1) {
                    modules[i].hidden = false;
                }
            }
        } else {
            for (let i = 0; i < modules.length; i++) {
                modules[i].hidden = true;
            }
        }

        setMods(modules);
    }

    const onFilterClick = (enableCheckboxState: boolean, disableCheckboxState: boolean) => {

        let state = -1;

        if (enableCheckboxState) state = 0;
        if (disableCheckboxState) state = 1;
        if (enableCheckboxState && disableCheckboxState) state = 2;

        if (mods === undefined) return;

        const modules = window.electron.game.module.getModules(props.serverId);

        for (let i = 0; i < modules.length; i++) {

            modules[i].hidden = false;

            switch (state) {
                case 0:
                    if (modules[i].state) modules[i].hidden = true;
                    break;
                case 1:
                    if (!modules[i].state) modules[i].hidden = true;
                    break;
                case 2:
                    modules[i].hidden = true;
                    break;
            }
        }

        setMods(modules);
    }

    return (
        <div className={styles.modListDiv}>

            {
                disabledDiv
                    ?
                    <div className={styles.disabledDiv}>
                        <div className={styles.disabledBackgroundDiv}>
                            <h1 className={styles.disabledTitle}>無法更動模組，請先關閉遊戲</h1>
                        </div>
                    </div> : null
            }

            {
                hiddenAlertConfirm ? <AlertConfirm title={alertConfirmTitle} description={alertConfirmDescription} onCancelClick={() => setHiddenAlertConfirm(false)} onConfirmClick={() => {

                    window.electron.game.module.moduleDelete(deleteFilePath);
                    setHiddenAlertConfirm(false);
                    setMods(window.electron.game.module.getModules(props.serverId));

                }} /> : null
            }

            <div className={styles.searchButtonDiv}>

                <InputIcon className={styles.inputIcon} type="text" icon="search" value={searchValue} onChange={(value) => {

                    setSearchValue(value);
                    search(value);

                }} />
                <ButtonFocus content="新增模組" className={styles.buttonFocus} onClick={() => hiddenFileInput.current.click()} />
                <input type="file" ref={hiddenFileInput} onChange={(event) => {
                    handleChange(event);
                    event.target.value = "";
                }} style={{ display: "none" }} multiple />

            </div>

            <div className={styles.textFilterDiv}>

                <div className={styles.leftDiv}>
                    <h1>狀態</h1>
                    <h2>名稱</h2>
                </div>

                <div className={styles.rightDiv}>
                    <h1>條件篩選</h1>
                    <Checkbox className={styles.checkbox} content="啟用" checked={enableCheckbox} onClickChecked={(state) => {
                        onFilterClick(state, disableCheckbox);
                        setEnableCheckbox(state);
                    }} />
                    <Checkbox className={styles.checkbox} content="停用" checked={disableCheckbox} onClickChecked={(state) => {
                        onFilterClick(enableCheckbox, state);
                        setDisableCheckbox(state);
                    }} />
                </div>

            </div>

            <div className={styles.listDiv}>
                {
                    mods !== undefined
                        ?
                        mods.map((item) => (
                            <div key={window.electron.uuid.getUUIDv4()}>
                                {
                                    item.hidden ? <Mod fileName={item.fileName} filePath={item.filePath} state={item.state} onDeleteClick={(fileName, filePath) => {
                                        setAlertConfirmTitle("你確定要刪除模組嗎？");
                                        setAlertConfirmDescription(`模組: ${fileName} 將會被永久刪除!`);
                                        setDeleteFilePath(filePath);
                                        setHiddenAlertConfirm(true);
                                    }} /> : null
                                }
                            </div>
                        ))
                        :
                        <div className={styles.notModsDiv}>
                            <h1>沒有任何模組</h1>
                        </div>
                }
            </div>

        </div>
    );
}

function isGameStart(serverId: string): boolean {

    const instance = window.electron.game.instance;
    const state = instance.getState(serverId);

    if (state === "onStandby" || state === "close" || state === "closeError" || state === "startError") {
        return false;
    }

    return true;
}