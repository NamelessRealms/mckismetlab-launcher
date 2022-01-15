import React from "react";
import JavaParameter from "./components/javaParameter/JavaParameter";
import JavaPath from "./components/javaPath/JavaPath";
import Ram from "./components/ram/Ram";
import styles from "./Parameters.scss";

type IProps = {
    checkbox: boolean;
    serverName?: string;
}

export default function Parameters(props: IProps) {

    const io = window.electron.io;
    const serverName = props.checkbox ? props.serverName === undefined ? "global" : props.serverName : "global";
    const isCheckbox = props.checkbox ? "instanceSetting" : "setting";

    const [ramMax, setRamMax] = React.useState(io.java.ram.getMaxSize(serverName) / 1024);
    const [ramMin, setRamMin] = React.useState(io.java.ram.getMinSize(serverName) / 1024);
    const [javaPath, setJavaPath] = React.useState(io.java.path.get(serverName));
    const [javaInJavaVMToggle, setJavaInJavaVMToggle] = React.useState(io.java.path.getIsBuiltInJavaVM(serverName));
    const [javaParameter, setJavaParameter] = React.useState(io.java.parameter.get(serverName));
    const [ramChecked, setRamChecked] = React.useState(serverName !== "global" ? io.java.ram.getChecked(serverName) : false);
    const [javaPathChecked, setJavaPathChecked] = React.useState(serverName !== "global" ? io.java.path.getChecked(serverName) : false);
    const [javaParameterChecked, setJavaParameterChecked] = React.useState(serverName !== "global" ? io.java.parameter.getChecked(serverName) : false);

    React.useEffect(() => {
        io.java.ram.setMaxSize(serverName, ramMax * 1024);
        io.java.ram.setMinSize(serverName, ramMin * 1024);
        io.java.path.set(serverName, javaPath);
        io.java.parameter.set(serverName, javaParameter);
        io.java.path.setIsBuiltInJavaVM(serverName, javaInJavaVMToggle);
    }, [ramMax, ramMin, javaPath, javaParameter, javaInJavaVMToggle]);

    if(serverName !== "global") {
        React.useEffect(() => {
            io.java.ram.setChecked(serverName, ramChecked);
            io.java.path.setChecked(serverName, javaPathChecked);
            io.java.parameter.setChecked(serverName, javaParameterChecked);
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
                onChangeJavaToggle={setJavaInJavaVMToggle}
                onChangeJavaPath={setJavaPath}
                onChecked={setJavaPathChecked}
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