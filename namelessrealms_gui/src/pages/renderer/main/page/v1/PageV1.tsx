import React from "react";
import styles from "./PageV1.scss";
import TopPlayer from "../../components/topPlayer/TopPlayer";
import BackgroundImg from "../../../../../assets/images/background/background.png";
import role01Img from "../../../../../assets/images/role/role-01.png";
import settingLinesImg from "../../../../../assets/icons/setting-lines.png";
import downArrowImg from "../../../../../assets/icons/down-arrow.png";
import ButtonPlay from "../../components/buttonPlay/buttonPlay";
import ServerList from "../../components/serverList/ServerList";

import { useHistory } from "react-router-dom";
import Trail from "../../../common/animations/components/trail/Trail";

type IProps = {
    serverData: {
        displayPositionId: number;
        serverName: string;
        title: string;
        description: string;
        serverId: string;
        version: string;
        link: string;
    }
    servers: Array<{
        displayPositionId: number;
        id: string;
        serverName: string;
        title: string;
        description: string;
        img: string;
        version: string;
        link: string;
        minecraftType: string;
    }>;
    onClickServer?: (displayPositionId: number, serverId: string) => void;
    onCrashClick?: (code: number, description: string) => void;
}

export default function PageV1(props: IProps) {

    const [downArrowImgHidden, setDownArrowImgHidden] = React.useState(true);

    const io = window.electron.io;
    // const [downloadComponent, setDownloadComponent] = React.useState(false);
    // const [progressBar, setProgressBar] = React.useState(0);
    // const [progressBarText, setProgressBarText] = React.useState("");

    const displayPositionId = props.serverData.displayPositionId;
    const serverName = props.serverData.serverName;
    const title = props.serverData.title;
    const description = props.serverData.description
    const serverId = props.serverData.serverId;
    const version = props.serverData.version;
    const link = props.serverData.link;
    const history = useHistory();

    return (
        // <div className={styles.pageV1} style={{ backgroundImage: `url(${BackgroundImg})` }} onScroll={(event: any) => {
        //     const scrollTop = event.target.scrollTop;
        //     if (scrollTop >= 20) {
        //         if (downArrowImgHidden) {
        //             setDownArrowImgHidden(false);
        //         }
        //     } else {
        //         if (!downArrowImgHidden) {
        //             setDownArrowImgHidden(true);
        //         }
        //     }
        // }}>
        // <div className={styles.pageV1} style={{ backgroundImage: `url(${BackgroundImg})` }}>
        <div className={styles.pageV1}>

            {/* <div className={styles.downloadStatusDiv} style={downloadComponent ? {} : { display: "none" }} >
                <img className={styles.cloudDownloadImg} src={cloudDownloadImg} alt="cloud-download" />
                <div className={styles.progressBarDiv}>
                    <h1>{progressBarText}</h1>
                    <div className={styles.progressBarOutside}>
                        <div className={styles.progressBarInside} style={{ width: `${progressBar}%` }}></div>
                    </div>
                </div>
                <h1>{progressBar}%</h1>
                <img className={styles.pauseImg} src={pauseImg} alt="pause" />
            </div> */}

            {
                downArrowImgHidden
                    ?
                    <div className={styles.downArrowDiv}>
                        <img src={downArrowImg} alt="down-arrow" />
                    </div>
                    : null
            }

            <div className={styles.scrollDiv}>

                <TopPlayer />

                <div className={styles.playServerGameDiv}>

                    <div className={styles.leftDiv}>
                        <Trail open={true}>
                            <h1 className={styles.serverNameH1}>{serverName}</h1>
                            <h2 className={styles.serverNameH2}>{title}</h2>
                            <div className={styles.buttonDiv}>
                                <div className={styles.settingButton} onClick={() => {

                                    // data save
                                    io.save();
                                    history.push(`/instanceSetting/${serverId}/1`);

                                }}>
                                    <img src={settingLinesImg} alt="setting-lines" />
                                </div>

                                <ButtonPlay serverId={serverId} onCrashClick={props.onCrashClick} />

                            </div>
                        </Trail>
                    </div>

                    <div className={styles.rightDiv}>
                        <img src={role01Img} alt="role" />
                    </div>

                </div>

                <ServerList servers={props.servers} displayPositionId={displayPositionId} onChangeDisplayPositionId={(displayPositionId) => {
                    if (props.onClickServer === undefined) return;
                    props.onClickServer(displayPositionId, serverId);
                }} />

                <div className={styles.aboutDiv}>

                    <div className={styles.leftDiv}>
                        <h1>關於</h1>
                        <h2>{description}</h2>
                    </div>

                    <div className={styles.rightDiv}>
                        <div>
                            <h1>官方網站</h1>
                            <h2 className={styles.link} onClick={() => window.open(link)}>{link}</h2>
                        </div>
                        <div>
                            <h1>伺服器版本</h1>
                            <h2>{version}</h2>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}