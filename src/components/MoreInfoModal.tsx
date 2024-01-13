import { createSignal, JSXElement, ParentComponent } from "solid-js";

import { ExternalLink, SimpleDialog } from "~/components";
import { useI18n } from "~/i18n/context";

export function FeesModal() {
    const i18n = useI18n();
    return (
        <MoreInfoModal
            title={i18n.t("modals.more_info.whats_with_the_fees")}
            linkText={i18n.t("common.why")}
        >
            <p>{i18n.t("modals.more_info.self_custodial")}</p>
            <p>{i18n.t("modals.more_info.future_payments")}</p>
            <p>
                <ExternalLink href="https://github.com/MutinyWallet/mutiny-web/wiki/Understanding-liquidity">
                    {i18n.t("modals.more_info.liquidity")}
                </ExternalLink>
            </p>
        </MoreInfoModal>
    );
}

const MoreInfoModal: ParentComponent<{
    linkText: string | JSXElement;
    title: string;
}> = (props) => {
    const [open, setOpen] = createSignal(false);

    return (
        <>
            <button
                tabIndex={-1}
                onClick={() => setOpen(true)}
                class="font-semibold underline decoration-light-text hover:decoration-white"
            >
                {props.linkText}
            </button>
            <SimpleDialog open={open()} setOpen={setOpen} title={props.title}>
                {props.children}
            </SimpleDialog>
        </>
    );
};
