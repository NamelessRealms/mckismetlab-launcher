import "./Frame.scss";

type IProps = {
    windowName: string;
    osType: "osx" | "windows" | "linux" | "unknown";
}

export default function Frame(props: IProps) {

    // const windowApi = getWindowApi(props.windowName);

    // if (windowApi === null) throw new Error(`Frame '${props.windowName}' null.`);

    return (
        <div data-tauri-drag-region className="frameDiv" style={props.osType === "osx" ? { flexDirection: "row-reverse" } : {}}>

            <div className="textDiv">
                <h1>BETA</h1>
            </div>

            {
                props.osType === "windows" || props.osType === "linux"
                    ?
                    <div className="windowsFrameButtonDiv">
                        <button>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 8 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M6 19h12v2H6v-2z" /></svg>
                        </button>
                        {/* {
                            props.windowName !== "main"
                                ?
                                <button onClick={() => maximize(windowApi)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 20" width="20px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M19 4H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H5V6h14v12z" /></svg>
                                </button>
                                :
                                null
                        } */}
                        {/* <button onClick={() => maximize(windowApi)}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 20" width="20px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M19 4H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H5V6h14v12z" /></svg>
                        </button> */}
                        <button className="closeButton">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" /></svg>
                        </button>
                    </div>
                    :
                    <div className="osxFrameButtonDiv">

                        <button className="osxCloseButton">
                            
                        </button>

                        <button className="osxMinimizeButton">

                        </button>

                        {/* <button className={styles.osxMaximizeButton} onClick={() => maximize(windowApi)}>

                        </button> */}

                    </div>
            }
        </div>
    );
}

// function minimize(windowApi: windowApi): void {
//     windowApi.minimize();
// }

// function maximize(windowApi: windowApi): void {
//     windowApi.maximize();
// }

// function close(windowApi: windowApi): void {
//     windowApi.close();
// }

// function getWindowApi(windowName: string) {
//     switch (windowName) {
//         case "main":
//             return window.electron.windowApi
//         case "gameLog":
//             return window.gameLogElectron.windowApi;
//         default:
//             return null;
//     }
// }

// interface windowApi {
//     minimize: () => void;
//     maximize: () => void;
//     close: () => void;
// }