import { QRCodeSVG } from "solid-qr-code";
import Modal from "./Modal";
import Card from "./Card";

export default function PeerConnectModal() {
    const connectString = "mutiny:02a91f8d620f5635a65a5f0cf51279ad9f73fd30f1bfdb4739342deddfba32fb7d@p.mutinywallet.com"
    return (
        <Modal>
            <div class="flex flex-col gap-4">
                <div class="w-full bg-white rounded-xl">
                    <QRCodeSVG value={connectString} class="w-full h-full p-8 max-h-[400px]" />
                </div>
                <Card>
                    <code class="break-all">{connectString}</code>
                </Card>
            </div>
        </Modal>
    )
}