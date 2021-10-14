import React from "react";
import styles from "./Login.scss";

import SelectLogin from "./components/selectLogin/SelectLogin";
import MojangLogin from "./components/mojangLogin/mojangLogin";
export default function Login() {

    const [toggleDiv, setToggleDiv] = React.useState(true);

    return (
        <div className={styles.LoginDiv}>
            {
                toggleDiv ? <SelectLogin onMojangClick={() => setToggleDiv(false)} /> : <MojangLogin onBackClick={() => setToggleDiv(true)} />
            }
        </div>
    );
}