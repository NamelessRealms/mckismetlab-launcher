import React from "react";
import styles from "./imageTool.scss";
import deleteForeverRedIcon from "../../../../../assets/icons/delete-forever-red.png";
import copyIcon from "../../../../../assets/icons/copy.png";

type IProps = {
    type: "ResourcePacks" | "Screenshots"
    title: string;
    filePath: string;
    imageSrc?: string;
    onDeleteClick?: (filePath: string) => void;
}

export default function ImageTool(props: IProps) {

    const [openImgPreview, setOpenImgPreview] = React.useState<boolean>(false);
    const [imgPreviewImgAnimaClassName, setImgPreviewImgAnimaClassName] = React.useState(styles.imgPreviewImgEnterAnima);
    const [imgPreviewAnimaClassName, setImgPreviewAnimaClassName] = React.useState(styles.imgPreviewEnterAnima);

    return (
        <div className={styles.imageToolDiv}>

            {
                openImgPreview
                    ?
                    <div className={`${styles.imgPreview} ${imgPreviewAnimaClassName}`} onClick={() => {
                        setImgPreviewImgAnimaClassName(styles.imgPreviewImgLeaveAnima);
                        setImgPreviewAnimaClassName(styles.imgPreviewLeaveAnima);
                        setTimeout(() => {
                            setOpenImgPreview(false);
                            setImgPreviewImgAnimaClassName(styles.imgPreviewImgEnterAnima);
                            setImgPreviewAnimaClassName(styles.imgPreviewEnterAnima);
                        }, 200);
                    }}>
                        <img src={props.imageSrc} className={imgPreviewImgAnimaClassName} alt="preview" />
                    </div>
                    : null
            }

            <div className={styles.imageToolContextDiv}>
                <div className={styles.serverBorderDiv} style={props.type === "Screenshots" ? { cursor: "pointer" } : {}}>

                    <div className={styles.toolsDiv}>
                        <div className={styles.toolsContainerDiv}>
                            {
                                props.type === "Screenshots"
                                    ?
                                    <div className={styles.iconDiv}>
                                        <img src={copyIcon} alt="copyIcon" onClick={() => {
                                            window.electron.clipboard.writeImage(props.filePath);
                                        }} />
                                    </div>
                                    : null
                            }
                            <div className={styles.iconDiv}>
                                <img src={deleteForeverRedIcon} alt="deleteForeverRedIcon" onClick={() => {
                                    if (props.onDeleteClick === undefined) return;
                                    props.onDeleteClick(props.filePath);
                                }} />
                            </div>
                        </div>
                    </div>

                    {
                        props.type === "Screenshots"
                            ?
                            <div className={styles.topDiv} style={{ backgroundImage: `url(${props.imageSrc})` }} onClick={() => setOpenImgPreview(true)}></div>
                            :
                            <div className={styles.topDiv} onClick={() => props.type === "Screenshots" ? setOpenImgPreview(true) : null}>
                                {
                                    props.imageSrc !== undefined ? <img className={styles.imageResourcePacks} src={props.imageSrc} /> : null
                                }
                            </div>
                    }

                    <div className={styles.bottomDiv} onClick={() => props.type === "Screenshots" ? setOpenImgPreview(true) : null}>
                        <h1>{props.title}</h1>
                    </div>

                </div>

            </div>
        </div>
    );
}