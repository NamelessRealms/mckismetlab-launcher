import React from "react";
import JavaParameter from "./components/javaParameter/JavaParameter";
import JavaPath from "./components/javaPath/JavaPath";
import Ram from "./components/ram/Ram";
import styles from "./Parameters.scss";

type IProps = {
    checkbox: boolean;
    serverId?: string;
}

export default function Parameters(props: IProps) {

    const io = window.electron.io;
    const os = window.electron.os;
    const serverId = props.checkbox ? props.serverId === undefined ? "global" : props.serverId : "global";
    const isCheckbox = props.checkbox ? "instanceSetting" : "setting";

    const [ramMax, setRamMax] = React.useState(io.java.ram.getMaxSize(serverId) / 1024);
    const [ramMin, setRamMin] = React.useState(io.java.ram.getMinSize(serverId) / 1024);
    const [javaPath, setJavaPath] = React.useState(io.java.path.get(serverId));
    const [javaPathChecking, setJavaPathChecking] = React.useState<boolean | undefined>(undefined);
    const [javaInJavaVMToggle, setJavaInJavaVMToggle] = React.useState(io.java.path.getIsBuiltInJavaVM(serverId));
    const [javaParameter, setJavaParameter] = React.useState(io.java.parameter.get(serverId));
    const [ramChecked, setRamChecked] = React.useState(serverId !== "global" ? io.java.ram.getChecked(serverId) : false);
    const [javaPathChecked, setJavaPathChecked] = React.useState(serverId !== "global" ? io.java.path.getChecked(serverId) : false);
    const [javaParameterChecked, setJavaParameterChecked] = React.useState(serverId !== "global" ? io.java.parameter.getChecked(serverId) : false);

    React.useEffect(() => {
        if(ramMin * 1024 >= ramMax * 1024) setRamMin(ramMax);
        io.java.ram.setMaxSize(serverId, ramMax * 1024);
    }, [ramMax]);

    React.useEffect(() => {
        if(ramMin * 1024 >= ramMax * 1024) setRamMax(ramMin);
        io.java.ram.setMinSize(serverId, ramMin * 1024);
    }, [ramMin]);

    React.useEffect(() => {
        io.java.path.set(serverId, javaPath);
        io.java.parameter.set(serverId, javaParameter);
        io.java.path.setIsBuiltInJavaVM(serverId, javaInJavaVMToggle);
    }, [javaPath, javaParameter, javaInJavaVMToggle]);

    if(serverId !== "global") {
        React.useEffect(() => {
            io.java.ram.setChecked(serverId, ramChecked);
            io.java.path.setChecked(serverId, javaPathChecked);
            io.java.parameter.setChecked(serverId, javaParameterChecked);
        }, [ramChecked, javaPathChecked, javaParameterChecked]);
    }

    return (
        <div className={styles.parametersDiv}>
            <Ram
                type={isCheckbox}
                ramChecked={ramChecked}
                ramMax={ramMax}
                ramMin={ramMin}
                onRamMaxChange={setRamMax}
                onRamMinChange={setRamMin}
                onRamChecked={setRamChecked}
            />
            <JavaPath
                type={isCheckbox}
                checked={javaPathChecked}
                value={javaPath}
                toggle={javaInJavaVMToggle}
                pathChecking={javaPathChecking}
                onChangeJavaToggle={setJavaInJavaVMToggle}
                onChangeJavaPath={setJavaPath}
                onChecked={setJavaPathChecked}
                onClickTest={async () => {
                    const state = await os.java.checkingPath(javaPath);
                    setJavaPathChecking(state);
                }}
                onClickAutoSearch={async () => {
                    const javaPath = await os.java.getPath();
                    setJavaPath(javaPath);
                    setJavaPathChecking(undefined);
                }}
                onClickManualSearched={(path) => {
                    setJavaPath(path);
                    setJavaPathChecking(undefined);
                }}
            />
            <JavaParameter
                type={isCheckbox}
                checked={javaParameterChecked}
                value={javaParameter}
                onChangeJavaParameter={setJavaParameter}
                onChecked={setJavaParameterChecked}
            />
        </div>
    );
}