import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationZhTw from "./assets/i18n/zh_tw.json";
import translationEnUs from "./assets/i18n/en_us.json";

const resources = {
    "zh-TW": {
        translation: translationZhTw
    },
    "en-US": {
        translation: translationEnUs
    }
}

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "zh-TW",
        fallbackLng: "zh-TW",
        interpolation: {
            escapeValue: false
        }
    });
