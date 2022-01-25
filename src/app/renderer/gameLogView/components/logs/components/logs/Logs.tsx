import React from "react";
import styles from "./Logs.scss";

type IProps = {
    logsFontSize: number;
    onGameLogText: (text: string) => void;
}

export default function Logs(props: IProps) {

    const [logs, setLogs] = React.useState<Array<{ key: string, text: string }>>(new Array());
    const logsElement = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        window.gameLogElectron.event.onGameLog((data) => {
            props.onGameLogText(data.text);
            setLogs((value) => [...value, data]);
            scrollToBottom();
        });
    }, []);

    const scrollToBottom = () => {
        if (logsElement.current === null) return;
        logsElement.current.scrollIntoView({ behavior: "smooth" })
    }

    return (
        <div className={styles.logsDiv}>
            {
                logs.map((item) => (
                    <div key={item.key} className={styles.logItemDiv}>
                        <h1 className={styles.logText} style={{ fontSize: `${props.logsFontSize}px` }}>{item.text}</h1>
                    </div>
                ))
            }
            <div ref={logsElement}></div>
        </div>
    )
}