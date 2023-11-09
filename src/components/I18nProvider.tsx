import i18next from "i18next";
import { createResource, ParentComponent, Show } from "solid-js";

import i18nConfig from "~/i18n/config";
import { I18nContext } from "~/i18n/context";

export const I18nProvider: ParentComponent = (props) => {
    const [i18nConfigured] = createResource(async () => {
        console.log("about to get the config");
        try {
            await i18nConfig;
        } catch (e) {
            console.error("Config error", e);
        }
        return true;
    });

    return (
        <Show when={i18nConfigured()}>
            <I18nContext.Provider value={i18next}>
                {props.children}
            </I18nContext.Provider>
        </Show>
    );
};
