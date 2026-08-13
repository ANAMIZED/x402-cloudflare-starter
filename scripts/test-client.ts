/**
 * x402 Auto-Paying Test Client
 *
 * Usage:
 *   npx tsx scripts/test-client.ts <url>
 *
 * Example:
 *   npx tsx scripts/test-client.ts https://your-worker.workers.dev/weather
 *
 * Environment variables (for testing only — never commit real keys):
 *   EVM_PRIVATE_KEY=0x...
 *   SVM_PRIVATE_KEY=...   (base58 encoded)
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
    console.error("\nUsage: npx tsx scripts/test-client.ts <url>\n");
    process.exit(1);
  }

  const evmPrivateKey = process.env.EVM_PRIVATE_KEY as `0x${string}` | undefined;
  const svmPrivateKey = process.env.SVM_PRIVATE_KEY;

  if (!evmPrivateKey && !svmPrivateKey) {
    console.error(
      "\nError: Set at least one of EVM_PRIVATE_KEY or SVM_PRIVATE_KEY\n"
    );
    process.exit(1);
  }

  const client = new x402Client();

  if (evmPrivateKey) {
    const account = privateKeyToAccount(evmPrivateKey);
    client.register("eip155:*", new ExactEvmScheme(account));
    console.log("✓ EVM signer loaded:", account.address);
  }

  if (svmPrivateKey) {
    try {
      const signer = await createKeyPairSignerFromBytes(
        base58.decode(svmPrivateKey)
      );
      client.register("solana:*", new ExactSvmScheme(signer));
      console.log("✓ Solana signer loaded:", signer.address);
    } catch (err) {
      console.error("Failed to load Solana signer:", err);
      process.exit(1);
    }
  }

  const fetchWithPayment = wrapFetchWithPayment(fetch, client);

  console.log(`\n→ Requesting: ${url}\n`);

  try {
    const response = await fetchWithPayment(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    const data = await response.json();

    console.log("Status:", response.status);
    console.log("Response:");
    console.log(JSON.stringify(data, null, 2));
    console.log("");
  } catch (err: any) {
    console.error("\nRequest failed:");
    console.error(err?.message || err);
    process.exit(1);
  }
}

main();
