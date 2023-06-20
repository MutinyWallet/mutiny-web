import i18next from 'i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
const i18n = i18next
  .use(HttpApi)
  .use(LanguageDetector)
  .init({
    fallbackLng: 'en',
    preload: ['en'],
    load: 'languageOnly',
    ns: ['translations'],
    defaultNS: 'translations',
    fallbackNS: false,
    debug: true,
    detection: {
      order: ['querystring', 'navigator', 'htmlTag'],
      lookupQuerystring: 'lang',
    },
    backend: {
      loadPath: 'src/i18n/{{lng}}/{{ns}}.json',
    }
  }, (err, t) => {
    // Do we actually wanna log something in case of an unsupported language? 
    if (err) return console.error(err)
  });
export default i18n;
