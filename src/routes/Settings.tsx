import { useNavigate } from "solid-start";
import KitchenSink from "~/components/KitchenSink";
import { Button, Card, DefaultMain, Hr, LargeHeader, SafeArea } from "~/components/layout";
import NavBar from "~/components/NavBar";
import { useMegaStore } from "~/state/megaStore";

export default function Settings() {
    const navigate = useNavigate();

    const [_, actions] = useMegaStore();

    function clearWaitlistId() {
        actions.setWaitlistId('');
        navigate("/")
    }

    function setTestWaitlistId() {
        actions.setWaitlistId('npub17zcnktw7svnechf5g666t33d7slw36sz8el3ep4c7kmyfwjhxn9qjvavs6');
        navigate("/")
    }

    function resetNode() {
        Object.keys(localStorage).forEach(function (key) {
            if (key.startsWith('waitlist_id')) {
                // Don't do anything because it's annoying to set my waitlist_id every time
            } else {
                localStorage.removeItem(key);
            }
        });
        navigate("/")
    }

    return (
        <SafeArea>
            <DefaultMain>
                <LargeHeader>Settings</LargeHeader>
                <Card title="Random utilities">
                    <Button onClick={clearWaitlistId}>Clear waitlist_id</Button>
                    <Button onClick={setTestWaitlistId}>Use test waitlist_id</Button>
                    <Button onClick={resetNode}>Reset node</Button>
                </Card>
                <Hr />
                <KitchenSink />
            </DefaultMain>
            <NavBar activeTab="settings" />
        </SafeArea>
    )
}