import React from "react";
import ButtonFocus from "../../../common/components/buttonFocus/ButtonFocus";
import styles from "./Language.scss";

import countryTaiwanImg from "../../../../../assets/images/country/taiwan.png";
import countryUSAImg from "../../../../../assets/images/country/usa.png";

import { useTranslation } from "react-i18next";

export default function Language() {

    const { t, i18n } = useTranslation();

    const [languageList, setLanguageList] = React.useState([
        {
            id: "zh_TW",
            title: t("setting.components.language.zh_tw.title"),
            description: t("setting.components.language.zh_tw.description"),
            translate: 100,
            countryImg: countryTaiwanImg,
            state: true
        },
        {
            id: "en_US",
            title: t("setting.components.language.en_us.title"),
            description: t("setting.components.language.en_us.description"),
            translate: 100,
            countryImg: countryUSAImg,
            state: false
        }
    ]);

    React.useEffect(() => {
        setLanguageList((items) => {
            return items.map((item) => {
                item.state = item.id === window.electron.io.language.get();
                return item;
            });
        });
    }, []);

    const onLanguageClick = (id: string) => {
        i18n.changeLanguage(id);
        window.electron.io.language.set(id);
        setLanguageList((items) => {
            return items.map((item) => {
                item.state = item.id === id;
                return item;
            });
        });
    }

    return (
        <div className={styles.languageDiv}>

            <h1 className={styles.headline}>{t("setting.menu.title_1.subTitle_3")}</h1>

            <div className={styles.buttonDiv}>
                <ButtonFocus className={styles.buttonFocus} content={t("setting.components.language.buttonTitle") as string} onClick={() => window.open("https://crowdin.com/project/mkllauncher")} />
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