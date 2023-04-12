import NavBar from "~/components/NavBar";
import { SafeArea } from "~/components/layout";

export default function Send() {
    return (
        <SafeArea main>
            <div class="w-full max-w-[400px] flex flex-col gap-4">
                <h1 class="text-2xl font-semibold uppercase border-b-2 border-b-white">Send Bitcoin</h1>
            </div>
            <NavBar activeTab="send" />
        </SafeArea >
    )
}