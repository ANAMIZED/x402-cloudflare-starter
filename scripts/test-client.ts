/**
 * Simple x402 Test Client
 * Automatically pays when it receives a 402
 *
 * Usage:
 *   npx tsx scripts/test-client.ts https://your-worker.workers.dev/weather
 *
 * Required environment variables (for testing only):
 *   EVM_PRIVATE_KEY=0x...
 *   SVM_PRIVATE_KEY=...   (base58)
 */

import { wrapFetchWithPayment } from "@x402/fetch";
import { x402Client } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { ExactSvmScheme } from "@x402/svm/exact/client";
import { privateKeyToAccount } from "viem/accounts";
import { createKeyPairSignerFromBytes } from "@solana/kit";
import { base58 } from "@scure/base";

async function main() {
  const url = process.argv[2];

  if (!url) {
    console.error("Usage: npx tsx scripts/test-client.ts <url>");
    process.exit(1);
  }

  const evmPrivateKey = process.env.EVM_PRIVATE_KEY as `0x${string}` | undefined;
  const svmPrivateKey = process.env.SVM_PRIVATE_KEY;

  if (!evmPrivateKey && !svmPrivateKey) {
    console.error("Error: Set at least one of EVM_PRIVATE_KEY or SVM_PRIVATE_KEY");
    process.exit(1);
  }

  const client = new x402Client();

  if (evmPrivateKey) {
    const account = privateKeyToAccount(evmPrivateKey);
    client.register("eip155:*", new ExactEvmScheme(account));
    console.log("EVM signer loaded:", account.address);
  }

  if (svmPrivateKey) {
    const signer = await createKeyPairSignerFromBytes(base58.decode(svmPrivateKey));
    client.register("solana:*", new ExactSvmScheme(signer));
    console.log("Solana signer loaded:", signer.address);
  }

  const fetchWithPayment = wrapFetchWithPayment(fetch, client);

  console.log(`\nRequesting: ${url}\n`);

  try {
    const response = await fetchWithPayment(url);
    const data = await response.json();

    console.log("Status:", response.status);
    console.log("Response:");
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
