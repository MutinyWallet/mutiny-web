import KitchenSink from "~/components/KitchenSink";
import NavBar from "~/components/NavBar";
import { Card, DefaultMain, LargeHeader, SafeArea, VStack } from "~/components/layout";

export default function Admin() {
    return (
        <SafeArea>
            <DefaultMain>
                <LargeHeader>Admin</LargeHeader>
                <VStack>
                    <Card><p>If you know what you're doing you're in the right place!</p></Card>
                    <KitchenSink />
                </VStack>
            </DefaultMain>
            <NavBar activeTab="none" />
        </SafeArea>
    )
}