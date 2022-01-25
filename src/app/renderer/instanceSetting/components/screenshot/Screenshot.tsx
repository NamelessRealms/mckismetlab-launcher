import React from "react";
import ButtonFocus from "../../../common/components/buttonFocus/ButtonFocus";
import ImageTool from "../../../common/components/imageTool/imageTool";
import styles from "./Screenshot.scss";

type IProps = {
    serverId: string;
}

export default function Screenshot(props: IProps) {

    const [screenshots, setScreenshots] = React.useState<Array<{ fileName: string; filePath: string; imageSrc: string | undefined }>>(new Array());

    React.useEffect(() => {
        setScreenshots(window.electron.game.screenshot.getScreenshots(props.serverId));
    }, []);

    return (
        <div className={styles.screenshotDiv}>

            <div className={styles.topDiv}>
                <ButtonFocus content="檢視資料夾" className={styles.buttonFocus} onClick={() => {
                    const screenshotsDirPath = window.electron.game.screenshot.getScreenshotsDirPath(props.serverId);
                    window.electron.open.pathFolder(screenshotsDirPath);
                }} />
            </div>

            <div className={styles.listDiv}>
                {
                    screenshots.map((item) => (
                        <ImageTool key={window.electron.uuid.getUUIDv4()} type="Screenshots" title={item.fileName} filePath={item.filePath} imageSrc={item.imageSrc} onDeleteClick={(filePath) => {
                            window.electron.game.screenshot.screenshotDelete(filePath);
                            setScreenshots(window.electron.game.screenshot.getScreenshots(props.serverId));
                        }} />
                    ))
                }
            </div>

        </div>
    );
}