import { Button } from "~/components/Button";
import NavBar from "~/components/NavBar";
import SafeArea from "~/components/SafeArea";

export default function Settings() {

    function clearWaitlistId() {
        localStorage.removeItem('waitlist_id');
        window.location.reload();
    }

    function setTestWaitlistId() {
        localStorage.setItem('waitlist_id', 'npub17zcnktw7svnechf5g666t33d7slw36sz8el3ep4c7kmyfwjhxn9qjvavs6');
        // reload the window
        window.location.reload();
    }

    return (
        <SafeArea>
            <main class='flex flex-col gap-4 py-8 px-4'>
                <Button onClick={clearWaitlistId}>Clear waitlist_id</Button>
                <Button onClick={setTestWaitlistId}>Use test waitlist_id</Button>
            </main>
            <NavBar activeTab="settings" />
        </SafeArea>
    )
}