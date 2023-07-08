import { use } from "i18next";
// FIXME: this doesn't work when deployed
// import HttpApi from 'i18next-http-backend';
import LanguageDetector from "i18next-browser-languagedetector";
import en from "~/i18n/en/translations";
import pt from "~/i18n/pt/translations";

const i18n = use(LanguageDetector).init(
    {
        fallbackLng: "en",
        preload: ["en"],
        load: "languageOnly",
        ns: ["translations"],
        defaultNS: "translations",
        fallbackNS: false,
        debug: true,
        detection: {
            order: ["querystring", "navigator", "htmlTag"],
            lookupQuerystring: "lang"
        },
        resources: {
            en: {
                translations: en
            },
            pt: {
                translations: pt
            }
        }
        // FIXME: this doesn't work when deployed
        // backend: {
        //   loadPath: 'src/i18n/{{lng}}/{{ns}}.json',
        // }
    },
    (err, _t) => {
        // Do we actually wanna log something in case of an unsupported language?
        if (err) return console.error(err);
    }
);
export default i18n;
