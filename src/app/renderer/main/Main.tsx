import React from "react";
import styles from "./Main.scss";

import TopPlayer from "./components/topPlayer/TopPlayer";
import BackgroundImg from "../../../assets/images/background/background.png";
import role01Img from "../../../assets/images/role/role-01.png";
import settingLinesImg from "../../../assets/icons/setting-lines.png";
import playImg from "../../../assets/icons/play.png";
import { useHistory } from "react-router-dom";

export default function Main() {

    const servers = [
        {
            displayPositionId: 0,
            id: "mckismetlab-main-server",
            serverName: "無名伺服器",
            title: "主服模組包伺服器",
            description: "我們提供大家能一起多人模組遊玩平台、模組討論區等伺服服務，讓你不用煩惱自架伺服器、如何跟朋友遊玩、不會玩模組的問題，並且我們有專屬無名啟動器幫助你裝模組、模組包，無名啟動器幫你解決一切問題(無名啟動器剛推出有BUG一定要說，讓我們來改進)。",
            img: "",
            version: "1.16.5",
            link: "https://mckismetlab.net"
        },
        {
            displayPositionId: 1,
            id: "mckismetlab-deputy-server",
            serverName: "無名伺服器",
            title: "副服模組包伺服器",
            description: "",
            img: "",
            version: "1.16.5",
            link: "https://mckismetlab.net"
        },
        {
            displayPositionId: 2,
            id: "mckismetlab-test-server",
            serverName: "無名伺服器",
            title: "測試服伺服器",
            description: "",
            img: "",
            version: "1.16.5",
            link: "https://mckismetlab.net"
        }
    ]

    const io = window.electron.io;
    const [displayPositionId, setDisplayPositionId] = React.useState(io.mainDisplayPosition.get());
    const findServer = servers.find((item) => item.displayPositionId === displayPositionId);

    if(findServer === undefined) throw new Error("findServer not null.");

    const serverName = findServer.serverName;
    const title = findServer.title;
    const description = findServer.description
    const id = findServer.id;
    const version = findServer.version;
    const link = findServer.link;
    const history = useHistory();

    React.useEffect(() => {
        io.mainDisplayPosition.set(displayPositionId);
    }, [displayPositionId]);

    return (
        <div className={styles.mainDiv} style={{ backgroundImage: `url(${BackgroundImg})` }}>

            <div className={styles.scrollDiv}>

                <TopPlayer />

                <div className={styles.playServerGameDiv}>

                    <div className={styles.leftDiv}>
                        <h1>{serverName}</h1>
                        <h2>{title}</h2>
                        <div className={styles.buttonDiv}>
                            <div className={styles.settingButton} onClick={() => {

                                io.save();
                                history.push(`/instanceSetting/${id}`);

                            }}>
                                <img src={settingLinesImg} alt="setting-lines" />
                            </div>
                            <div className={styles.playButton}>
                                <h1>開始遊戲</h1>
                                <img src={playImg} />
                            </div>
                        </div>
                    </div>

                    <div className={styles.rightDiv}>
                        <img src={role01Img} alt="role" />
                    </div>

                </div>

                <div className={styles.serverListDiv}>

                    <div className={styles.leftDiv}>
                        <h1>伺服器</h1>
                    </div>

                    <div className={styles.rightDiv}>
                        {
                            servers.map(item => {
                                if (item.displayPositionId !== displayPositionId) {
                                    return (
                                        <div key={window.electron.uuid.getUUIDv4()} className={styles.serverDiv} onClick={() => setDisplayPositionId(item.displayPositionId)}>
                                            <div className={styles.serverBorderDiv}>
                                                <div>

                                                </div>
                                            </div>
                                            <h1>{item.title}</h1>
                                        </div>
                                    )
                                } else {
                                    return null;
                                }
                            })
                        }
                    </div>
                </div>

                <div className={styles.aboutDiv}>

                    <div className={styles.leftDiv}>
                        <h1>關於</h1>
                        <h2>{description}</h2>
                    </div>

                    <div className={styles.rightDiv}>
                        <div>
                            <h1>官方網站</h1>
                            <h2 className={styles.link}>{link}</h2>
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