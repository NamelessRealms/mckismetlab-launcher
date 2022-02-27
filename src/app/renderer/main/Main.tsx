import React from "react";
import styles from "./Main.scss";
import PageV1 from "./page/v1/PageV1";
import serverImg01 from "../../../assets/images/background/server_ba_02.png";
import serverImg02 from "../../../assets/images/background/server_ba_03.png";
import serverImg03 from "../../../assets/images/background/server_ba_05.png";
import CrashPayback from "../common/components/crashPayback/CrashPayback";

export default function Main() {

    const servers = [
        {
            displayPositionId: 0,
            id: "mckismetlab-main-server",
            serverName: "無名伺服器",
            title: "主服模組包伺服器",
            description: "我們提供大家能一起多人模組遊玩平台、模組討論區等伺服服務，讓你不用煩惱自架伺服器、如何跟朋友遊玩、不會玩模組的問題，並且我們有專屬無名啟動器幫助你裝模組、模組包，無名啟動器幫你解決一切問題(無名啟動器剛推出有BUG一定要說，讓我們來改進)。",
            img: serverImg01,
            version: "1.16.5",
            link: "https://mckismetlab.net",
            minecraftType: "minecraftModpack"
        },
        {
            displayPositionId: 1,
            id: "mckismetlab-deputy-server",
            serverName: "無名伺服器",
            title: "副服模組包伺服器",
            description: "",
            img: serverImg02,
            version: "1.16.5",
            link: "https://mckismetlab.net",
            minecraftType: "minecraftModpack"
        },
        {
            displayPositionId: 2,
            id: "mckismetlab-test-server",
            serverName: "無名伺服器",
            title: "測試服伺服器",
            description: "",
            img: serverImg03,
            version: "1.18.1",
            link: "https://mckismetlab.net",
            minecraftType: "minecraftVanilla"
        }
    ]

    const io = window.electron.io;
    const [displayPositionId, setDisplayPositionId] = React.useState(io.mainDisplayPosition.get());
    const [catchType, setCatchType] = React.useState<"minecraft" | "launcher" | "flx" | undefined>();
    const [catchDescription, setCatchDescription] = React.useState<string>("");

    return (
        <div className={styles.mainDiv} >

            {
                catchType !== undefined ? <CrashPayback type={catchType} onCloseClick={() => setCatchType(undefined)} description={catchDescription} /> : null
            }

            {
                servers.map((item) => (
                    displayPositionId === item.displayPositionId
                    ?
                    <PageV1
                        key={window.electron.uuid.getUUIDv4()}
                        serverData={{
                            displayPositionId: item.displayPositionId,
                            serverName: item.serverName,
                            title: item.title,
                            description: item.description,
                            serverId: item.id,
                            version: item.version,
                            link: item.link
                        }}
                        servers={servers}
                        onClickServer={(displayPositionId) => setDisplayPositionId(displayPositionId)}
                        onCrashClick={(code, description) => {
                            setCatchDescription(description);
                            if(code === 0) {
                                setCatchType("minecraft");
                            } else if(code === 1) {
                                setCatchType("launcher");
                            } else if(code === 2) {
                                setCatchType("flx");
                            }
                        }}
                    /> : null
                ))
            }
        </div>
    )
}