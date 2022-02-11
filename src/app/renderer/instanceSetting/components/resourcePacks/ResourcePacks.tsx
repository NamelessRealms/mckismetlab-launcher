import React from "react";
import ButtonFocus from "../../../common/components/buttonFocus/ButtonFocus";
import styles from "./ResourcePacks.scss";
import ImageTool from "../../../common/components/imageTool/imageTool";

type IProps = {
    serverId: string;
}

export default function ResourcePacks(props: IProps) {

    const hiddenFileInput = React.useRef<any>(null);
    const [packs, setPacks] = React.useState<Array<{ fileName: string; filePath: string; imageSrc: string | undefined }>>();

    React.useEffect(() => {
        const packs = window.electron.game.resourcePack.getResourcePacks(props.serverId);
        if(packs.length > 0) setPacks(packs);
    }, []);

    const handleChange = (event: any) => {
        for (let file of event.target.files) {
            window.electron.game.resourcePack.copyResourcePackFile({ name: file.name, path: file.path }, props.serverId);
        }
        setPacks(window.electron.game.resourcePack.getResourcePacks(props.serverId));
    };

    return (
        <div className={styles.resourcePacksDiv}>

            <div className={styles.topDiv}>
                <ButtonFocus content="檢視資料夾" className={styles.buttonFocus} onClick={() => {
                    const resourcePacksDirPath = window.electron.game.resourcePack.getResourcePacksDirPath(props.serverId);
                    window.electron.open.pathFolder(resourcePacksDirPath);
                }} />
                <ButtonFocus content="新增資源包" className={styles.buttonFocus} onClick={() => hiddenFileInput.current.click()} />
                <input type="file" ref={hiddenFileInput} onChange={(event) => {
                    handleChange(event);
                    event.target.value = "";
                }} style={{ display: "none" }} multiple />
            </div>

            <div className={styles.listDiv}>
                {
                    packs !== undefined
                    ?
                    packs.map((item) => (
                        <ImageTool key={window.electron.uuid.getUUIDv4()} type="ResourcePacks" title={item.fileName} filePath={item.filePath} imageSrc={item.imageSrc} onDeleteClick={(filePath) => {
                            window.electron.game.resourcePack.resourcePackDelete(filePath);
                            setPacks(window.electron.game.resourcePack.getResourcePacks(props.serverId));
                        }} />
                    ))
                    :
                    <div className={styles.motPacks}>
                        <h1>沒有任何資源包</h1>
                    </div>
                }
            </div>

        </div>
    );
}