import { Network } from "~/logic/mutinyWalletSetup"

export default function mempoolTxUrl(txid?: string, network?: Network) {
    if (!txid || !network) {
        console.error("Problem creating the mempool url")
        return "#"
    }

    if (network) {
        switch (network) {
            case "bitcoin":
                return `https://mempool.space/tx/${txid}`
            case "testnet":
                return `https://mempool.space/testnet/tx/${txid}`
            case "signet":
                return `https://mutinynet.com/tx/${txid}`
            default:
                return `https://mempool.space/tx/${txid}`
        }
    }

    return `https://mempool.space/tx/${txid}`
}