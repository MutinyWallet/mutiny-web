import init, { PaymentParams } from "@mutinywallet/waila-wasm";

await init();

async function parsePaymentRequest(str: string) {
  let params;
  try {
    params = new PaymentParams(str || "");
  } catch (e) {
    console.error(e);
    return { ok: false, error: new Error("Invalid payment request") };
  }
  return {
    ok: true,
    value: {
      address: params.address,
      invoice: params.invoice,
      amount_sats: params.amount_sats,
      network: "signet",
      memo: params.memo,
      node_pubkey: params.node_pubkey,
      lnurl: params.lnurl
    }
  };
}

self.onmessage = async (e) => {
  console.log("Worker: Message received from main script");
  const input = e.data;
  if (typeof input === "string") {
    const result = await parsePaymentRequest(input);
    postMessage(result);
  }
};
