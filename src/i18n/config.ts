import { use } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";

export const defaultNS = "translations";

const i18n = use(HttpApi)
    .use(LanguageDetector)
    .init(
        {
            returnNull: false,
            fallbackLng: "en",
            preload: ["en"],
            load: "languageOnly",
            fallbackNS: false,
            debug: true,
            detection: {
                order: ["localStorage", "querystring", "navigator", "htmlTag"],
                lookupQuerystring: "lang",
                lookupLocalStorage: "i18nextLng",
                caches: ["localStorage"]
            },
            backend: {
                loadPath: "/i18n/{{lng}}.json"
            }
        },
        (err, _t) => {
            // Do we actually wanna log something in case of an unsupported language?
            if (err) return console.error(err);
        }
    );
export default i18n;
