import { createMemo, JSX } from "solid-js";

import { CopyButton, SimpleDialog } from "~/components";
import { useI18n } from "~/i18n/context";

export function JsonModal(props: {
    title: string;
    open: boolean;
    plaintext?: string;
    data?: unknown;
    setOpen: (open: boolean) => void;
    children?: JSX.Element;
}) {
    const i18n = useI18n();
    const json = createMemo(() =>
        props.plaintext ? props.plaintext : JSON.stringify(props.data, null, 2)
    );

    return (
        <SimpleDialog
            title={props.title}
            open={props.open}
            setOpen={props.setOpen}
        >
            <div class="max-h-[50vh] overflow-y-scroll rounded-xl bg-white/5 p-4 disable-scrollbars">
                <pre class="whitespace-pre-wrap break-all">{json()}</pre>
            </div>
            {props.children}
            <div class="self-center">
                <CopyButton title={i18n.t("common.copy")} text={json()} />
            </div>
        </SimpleDialog>
    );
}
