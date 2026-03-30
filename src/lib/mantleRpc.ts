const RPC_URL = "https://rpc.mantle.xyz";

async function rpcCall(method: string, params: unknown[] = []) {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

export async function getBalance(address: string): Promise<string> {
  const hex = await rpcCall("eth_getBalance", [address, "latest"]);
  const wei = BigInt(hex);
  const mnt = Number(wei) / 1e18;
  return mnt.toFixed(4);
}

export async function getTransactionCount(address: string): Promise<number> {
  const hex = await rpcCall("eth_getTransactionCount", [address, "latest"]);
  return parseInt(hex, 16);
}

export async function getLatestBlockNumber(): Promise<number> {
  const hex = await rpcCall("eth_blockNumber");
  return parseInt(hex, 16);
}

export async function getBlock(blockNumberHex: string) {
  return rpcCall("eth_getBlockByNumber", [blockNumberHex, false]);
}
