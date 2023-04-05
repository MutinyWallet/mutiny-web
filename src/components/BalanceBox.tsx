import { Motion, Presence } from "@motionone/solid";
import { MutinyBalance } from "@mutinywallet/node-manager";

import { useNodeManager } from "~/state/nodeManagerState";

function prettyPrintAmount(n?: number | bigint): string {
    if (!n || n.valueOf() === 0) {
        return "0"
    }
    return n.toLocaleString().replaceAll(",", "_")
}

function prettyPrintBalance(b: MutinyBalance): string {
    return prettyPrintAmount(b.confirmed.valueOf() + b.lightning.valueOf())
}

export default function BalanceBox() {
    const { balance, refetchBalance } = useNodeManager();

    return (
        <Presence>
            <Motion
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, easing: [0.87, 0, 0.13, 1] }}
            >
                <div class='border border-white rounded-xl border-b-4 p-4 flex flex-col gap-2'>
                    <header class='text-sm font-semibold uppercase'>
                        Balance
                    </header>
                    <div onClick={refetchBalance}>
                        <h1 class='text-4xl font-light'>
                            {balance() && prettyPrintBalance(balance())} <span class='text-xl'>SAT</span>
                        </h1>
                    </div>
                    <div class="flex gap-2 py-4">
                        <button class='bg-[#1EA67F] p-4 flex-1 rounded-xl text-xl font-semibold '><span class="drop-shadow-sm shadow-black">Send</span></button>
                        <button class='bg-[#3B6CCC] p-4 flex-1 rounded-xl text-xl font-semibold '><span class="drop-shadow-sm shadow-black">Receive</span></button>
                    </div>
                </div>
            </Motion>
        </Presence>
    )
}
