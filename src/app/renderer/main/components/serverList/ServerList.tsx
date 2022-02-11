import React from "react";
import styles from "./ServerList.scss";

interface IServer {
    displayPositionId: number;
    id: string;
    serverName: string;
    title: string;
    description: string
    img: string;
    version: string;
    link: string;
    minecraftType: string;
}

type IProps = {
    servers: Array<IServer>;
    displayPositionId: number;
    onChangeDisplayPositionId?: (id: number) => void;
}

export default function ServerList(props: IProps) {

    const io = window.electron.io;

    React.useEffect(() => {
        io.mainDisplayPosition.set(props.displayPositionId);
    }, [props.displayPositionId]);

    return (
        <div className={styles.serverListDiv}>
            <div className={styles.leftDiv}>
                <h1>伺服器</h1>
            </div>

            <div className={styles.rightDiv}>
                {
                    props.servers.map(item => {
                        if (item.displayPositionId !== props.displayPositionId) {
                            return (
                                <div key={window.electron.uuid.getUUIDv4()} className={styles.serverDiv} onClick={() => {
                                    if(props.onChangeDisplayPositionId === undefined) return;
                                    props.onChangeDisplayPositionId(item.displayPositionId);
                                }}>
                                    <div className={styles.serverBorderDiv}>
                                        <div>
                                            <img src={item.img} />
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
    )
}