import { Collapsible } from "@kobalte/core";
import { Contract } from "@mutinywallet/mutiny-wasm";
import { createResource, For, Suspense } from "solid-js";

import { Button, InnerCard, VStack } from "~/components";
import { useMegaStore } from "~/state/megaStore";

type RefetchDLCsType = (
    info?: unknown
) => Contract[] | Promise<Contract[] | undefined> | null | undefined;

function DLCItem(props: { dlc: Contract; refetch: RefetchDLCsType }) {
    const [state, _] = useMegaStore();

    const handleRejectDLC = async () => {
        await state.mutiny_wallet?.reject_dlc_offer(props.dlc.id);
        await props.refetch();
    };

    const handleAcceptDLC = async () => {
        await state.mutiny_wallet?.accept_dlc_offer(props.dlc.id);
    };

    const handleCloseDLC = async () => {
        const userInput = prompt("Enter oracle sigs:");
        if (userInput != null) {
            await state.mutiny_wallet?.close_dlc(
                props.dlc.id,
                userInput.trim()
            );
        }
    };

    return (
        <Collapsible.Root>
            <Collapsible.Trigger class="w-full">
                <h2 class="truncate rounded bg-neutral-200 px-4 py-2 text-start font-mono text-lg text-black">
                    {">"} {props.dlc.id}
                </h2>
            </Collapsible.Trigger>
            <Collapsible.Content>
                <VStack>
                    <pre class="overflow-x-auto whitespace-pre-wrap break-all">
                        {JSON.stringify(props.dlc, null, 2)}
                    </pre>
                    <Button intent="green" layout="xs" onClick={handleCloseDLC}>
                        Close
                    </Button>
                    <Button
                        intent="green"
                        layout="xs"
                        onClick={handleAcceptDLC}
                    >
                        Accept
                    </Button>
                    <Button intent="red" layout="xs" onClick={handleRejectDLC}>
                        Reject
                    </Button>
                </VStack>
            </Collapsible.Content>
        </Collapsible.Root>
    );
}

export function DLCsList() {
    const [state, _] = useMegaStore();

    const getDLCs = async () => {
        return (await state.mutiny_wallet?.list_dlcs()) as Promise<Contract[]>;
    };

    const [dlcs, { refetch }] = createResource(getDLCs);

    return (
        <>
            <InnerCard title="DLCs">
                {/* By wrapping this in a suspense I don't cause the page to jump to the top */}
                <Suspense>
                    <VStack>
                        <For
                            each={dlcs.latest}
                            fallback={<code>No DLCs found.</code>}
                        >
                            {(dlc) => <DLCItem dlc={dlc} refetch={refetch} />}
                        </For>
                    </VStack>
                </Suspense>
                <Button layout="small" onClick={refetch}>
                    Refresh
                </Button>
            </InnerCard>
        </>
    );
}
