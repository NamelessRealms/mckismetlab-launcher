import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationZhTw from "./assets/i18n/zh_tw.json";
import translationEnUs from "./assets/i18n/en_us.json";

const resources = {
    "zh_tw": {
        translation: translationZhTw
    },
    "en_us": {
        translation: translationEnUs
    }
}

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "zh_tw",
        fallbackLng: "zh_tw",
        interpolation: {
            escapeValue: false
        }
    });
