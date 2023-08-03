import React from "react";
import styles from "./DropMenu.scss";

import Trail from "../../animations/components/trail/Trail";
import arrowImg from "../../../../../assets/icons/arrow.png";

interface IProps {
    items: Array<{
        id: string;
        value: string;
    }>;

    value: string;
    onChange?: (id: string) => void;
}

export default function DropMenu(props: IProps) {

    const [value, setValue] = React.useState<string>(props.value);
    const [open, setOpen] = React.useState(false);
    const [displayNone, setDisplayNone] = React.useState(true);

    const findItemText = () => {
        const find = props.items.find((item) => item.id === value);
        return find !== undefined ? find.value : undefined;
    }

    return (
        <div className={styles.dropMenuDiv}>
            <div className={styles.dropMenuButton} onClick={() => setOpen((value) => !value)}>
                <h1 className={styles.dropMenuButtonText}>
                    {
                        findItemText() !== undefined ? findItemText() : ""
                    }
                </h1>
                <img className={styles.arrowImg} src={arrowImg} alt="arrow" style={ displayNone ? { transform: "rotate(0deg)" } : { transform: "rotate(90deg)" } } />
            </div>
            <div className={styles.menu} style={open ? { background: "#262626" } : displayNone ? { display: "none" } : {}}>
                <Trail open={open} onStart={() => setDisplayNone(false)} onCloseEnd={() => setDisplayNone(true)}>
                    {
                        props.items.map((item) => (
                            <div key={item.value} onClick={() => {
                                setOpen(false);
                                setValue(item.id);
                                if(props.onChange !== undefined) props.onChange(item.id);
                            }}>
                                <h1>{item.value}</h1>
                            </div>
                        ))
                    }
                </Trail>
            </div>
        </div>
    )
}