import React from "react";
import ButtonFocus from "../../../common/components/buttonFocus/ButtonFocus";
import styles from "./Language.scss";

import countryTaiwanImg from "../../../../../assets/images/country/taiwan.png";
import countryUSAImg from "../../../../../assets/images/country/usa.png";

export default function Language() {

    const [languageList, setLanguageList] = React.useState([
        {
            id: "zh_tw",
            title: "繁體中⽂",
            description: "繁體中⽂(台灣)",
            translate: 100,
            countryImg: countryTaiwanImg,
            state: true
        },
        {
            id: "en_us",
            title: "英⽂",
            description: "英語(美國)",
            translate: 10,
            countryImg: countryUSAImg,
            state: false
        }
    ]);

    const onLanguageClick = (id: string) => {

        setLanguageList((items) => {
            return items.map((item) => {
                item.state = item.id === id;
                return item;
            });
        });

    }

    return (
        <div className={styles.languageDiv}>

            <div className={styles.buttonDiv}>
                <ButtonFocus className={styles.buttonFocus} content="協助翻譯" onClick={() => window.open("https://crowdin.com/project/mkllauncher")} />
            </div>

            <div className={styles.listDiv}>
                {
                    languageList.map((item) => (
                        <div key={item.id} className={styles.itemDiv} onClick={() => onLanguageClick(item.id)}>
                            <div className={styles.leftDiv}>
                                <div className={styles.outerCircle}>
                                    {
                                        item.state ? <div className={styles.innerCircle}></div> : null
                                    }
                                </div>
                                <h1>{item.title}</h1>
                            </div>
                            <div className={styles.rightDiv}>
                                    <h1>{item.description}</h1>
                                    <h2>{item.translate}%</h2>
                                    <img src={item.countryImg} alt="country" />
                            </div>
                        </div>
                    ))
                }
            </div>

        </div>
    );
}