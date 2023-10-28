import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationZhTw from "./assets/i18n/zh_TW.json";
import translationEnUs from "./assets/i18n/en_US.json";

const resources = {
    "zh_TW": {
        translation: translationZhTw
    },
    "en_US": {
        translation: translationEnUs
    }
}

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "zh_TW",
        fallbackLng: "zh_TW",
        interpolation: {
            escapeValue: false
        }
    });
