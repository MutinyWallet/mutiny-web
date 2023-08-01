import { AmountCard } from "~/components/AmountCard";
import { Fee } from "~/components/Fee";
import NavBar from "~/components/NavBar";
import { OnboardWarning } from "~/components/OnboardWarning";
import { ShareCard } from "~/components/ShareCard";
import {
    Button,
    DefaultMain,
    LargeHeader,
    SafeArea,
    VStack
} from "~/components/layout";

const SAMPLE =
    "bitcoin:tb1prqm8xtlgme0vmw5s30lgf0a4f5g4mkgsqundwmpu6thrg8zr6uvq2qrhzq?amount=0.001&lightning=lntbs1m1pj9n9xjsp5xgdrmvprtm67p7nq4neparalexlhlmtxx87zx6xeqthsplu842zspp546d6zd2seyaxpapaxx62m88yz3xueqtjmn9v6wj8y56np8weqsxqdqqnp4qdn2hj8tfknpuvdg6tz9yrf3e27ltrx9y58c24jh89lnm43yjwfc5xqrpwjcqpj9qrsgq5sdgh0m3ur5mu5hrmmag4mx9yvy86f83pd0x9ww80kgck6tac3thuzkj0mrtltaxwnlfea95h2re7tj4qsnwzxlvrdmyq2h9mgapnycpppz6k6";
export default function Admin() {
    return (
        <SafeArea>
            <DefaultMain>
                <LargeHeader>Storybook</LargeHeader>
                <OnboardWarning />
                <VStack>
                    <AmountCard amountSats={"100000"} fee={"69"} />
                    <ShareCard text={SAMPLE} />
                    <Button loading intent="blue">
                        Button
                    </Button>
                    <Fee amountSats={15000n} />
                </VStack>
            </DefaultMain>
            <NavBar activeTab="none" />
        </SafeArea>
    );
}
