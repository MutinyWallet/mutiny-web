import { Title } from "solid-start";
import { HttpStatusCode } from "solid-start/server";
import {
  Button,
  ButtonLink,
  DefaultMain,
  LargeHeader,
  SafeArea,
  VStack
} from "~/components/layout";
import { Show, createSignal, onCleanup, onMount } from "solid-js";
import { Result } from "~/utils/typescript";
import { ParsedParams } from "./Scanner";
import init, { PaymentParams } from "@mutinywallet/waila-wasm";

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString();
};

const TEST_STRING =
  "bitcoin:tb1pa3rcqwdh0ja64zypvl84vq270rx2k3lu6fmhl5kyc7fx6quvhpfsvksj9h?amount=0.0001&lightning=lntbs100u1pj82xacsp5yyep60rvmdd2j0e0lxq9438m57mv638sa0gffvm4f3tfatcqjsuqpp5xqge9ff6jem8ej6sdgps2tcmlf3p83sauh37fpad0axl7gwvhx9qdqqnp4qdn2hj8tfknpuvdg6tz9yrf3e27ltrx9y58c24jh89lnm43yjwfc5xqrpwjcqzzn9qyysgqs0jcghea2pqjuhcf4qpsfd4z87ruj5zjrapqwmfzczh9zxfeygxkhkd09k3g5uuv2q23xkfnu6dhmpznzwwwqpfv8gq4ysh70t334fsqsst62x";

type SharedMessage = { type: string; key: any; value: any };

export default function Test() {
  const [worker, setWorker] = createSignal<Worker>();
  const [workerResponse, setWorkerResponse] = createSignal<Result<ParsedParams>>();

  const [sharedWorkerResponse, setSharedWorkerResponse] = createSignal<SharedMessage>();

  const [sharedWorker, setSharedWorker] = createSignal<SharedWorker>();

  async function test() {
    worker()?.postMessage(TEST_STRING);
  }

  async function testGet() {
    sharedWorker()?.port.postMessage({ type: "get", key: "test", value: 42 });
  }

  async function testSet() {
    sharedWorker()?.port.postMessage({
      type: "set",
      key: "test",
      value: sharedWorkerResponse()?.value * 2
    });
  }

  onMount(() => {
    setWorker(new Worker(new URL("../workers/waila.ts", import.meta.url), { type: "module" }));
    const workValue = worker()!;
    workValue.onmessage = (e: MessageEvent) => {
      console.log("Message received from worker");
      setWorkerResponse(e.data);
    };

    setSharedWorker(
      new SharedWorker(new URL("../workers/sharedTest.ts", import.meta.url), { type: "module" })
    );
    const sharedWorkValue = sharedWorker()!;
    sharedWorkValue.port.onmessage = (e: MessageEvent) => {
      console.log("Message received from shared worker");
      setSharedWorkerResponse(e.data);
    };
  });

  onCleanup(() => {
    worker()?.terminate();
    sharedWorker()?.port.close();
  });

  return (
    <SafeArea>
      <DefaultMain>
        <LargeHeader>Yoo</LargeHeader>
        <VStack biggap>
          <VStack>
            <Button onClick={test}>Test Parse</Button>
            <pre>{JSON.stringify(workerResponse(), null, 2)}</pre>
          </VStack>
          <VStack>
            <Button onClick={testGet}>Test Shared Get</Button>
            <Button onClick={testSet}>Test Shared Set * 2</Button>
            <pre>{JSON.stringify(sharedWorkerResponse(), null, 2)}</pre>
          </VStack>
        </VStack>
      </DefaultMain>
    </SafeArea>
  );
}
