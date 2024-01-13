import { TagItem } from "@mutinywallet/mutiny-wasm";

import { LabelCircle } from "~/components";
import { PseudoContact } from "~/utils";

export function ContactButton(props: {
    contact: PseudoContact | TagItem;
    onClick: () => void;
}) {
    return (
        <button class="flex items-center gap-2" onClick={() => props.onClick()}>
            <LabelCircle
                name={props.contact.name}
                image_url={props.contact.primal_image_url}
                contact
                label={false}
            />
            <div class="flex flex-1 flex-col items-start">
                <h2 class="overflow-hidden overflow-ellipsis text-base font-semibold">
                    {props.contact.name}
                </h2>
                <h3 class="overflow-hidden overflow-ellipsis text-left text-xs font-normal text-m-grey-400">
                    {props.contact.ln_address || ""}
                </h3>
            </div>
        </button>
    );
}
