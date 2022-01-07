import React from "react";
import JavaParameter from "./components/javaParameter/JavaParameter";
import JavaPath from "./components/javaPath/JavaPath";
import Ram from "./components/ram/Ram";
import styles from "./Parameters.scss";

export default function Parameters() {

    const [ramMax, setRamMax] = React.useState(10);
    const [ramMin, setRamMin] = React.useState(1);
    const [javaPath, setJavaPath] = React.useState("C:/Program Files/Java/jre1.8.0_291/bin/javaw.exe");
    const [javaParameter, setJavaParameter] = React.useState("");

    return (
        <div className={styles.parametersDiv}>
            <Ram ramMax={ramMax} ramMin={ramMin} onRamMaxChange={setRamMax} onRamMinChange={setRamMin} />
            <JavaPath value={javaPath} onChangeJavaPath={setJavaPath} />
            <JavaParameter value={javaParameter} onChangeJavaParameter={setJavaParameter} />
        </div>
    );
}