import { Hono } from "hono";
import { paymentMiddleware, x402ResourceServer } from "@x402/hono";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { ExactSvmScheme } from "@x402/svm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { facilitator } from "@payai/facilitator";
import { BASE_USDC, NETWORKS, RECEIVE, SKUS, skuByPath, type Sku } from "./catalog";
import { DEMO_HTML } from "./demo-page";

type Env = {
  BASE_ADDRESS: string;
  SOLANA_ADDRESS: string;
};

const app = new Hono<{ Bindings: Env }>();

function accepts(sku: Sku, baseAddress: string, solanaAddress: string) {
  return [
    {
      scheme: "exact" as const,
      price: sku.price,
      network: NETWORKS.base,
      payTo: baseAddress,
    },
    {
      scheme: "exact" as const,
      price: sku.price,
      network: NETWORKS.solana,
      payTo: solanaAddress,
    },
  ];
}

const RECEIPT_CAP = 50;
const receipts: Array<Record<string, unknown>> = [];

function resolvePayTo(envAddr: string | undefined, documented: string) {
  if (!envAddr || envAddr.startsWith("0xYour") || envAddr.startsWith("YourSolana")) {
    return documented;
  }
  return envAddr;
}

function receipt(sku: Sku, network = NETWORKS.base) {
  const rec = {
    receipt_id: `rcpt_${crypto.randomUUID()}`,
    paid: true,
    protocol: "x402",
    sku: sku.id,
    unit: sku.unit,
    price: sku.price,
    asset: "USDC",
    network_primary: NETWORKS.base,
    network_settled: network,
    pay_to_base: RECEIVE.evm,
    usdc_base: BASE_USDC,
    networks: [NETWORKS.base, NETWORKS.solana],
    stripe_parallel: sku.stripe,
    fulfillment: "receipt-only",
    note: "Host owns entitlements. Sync on ANAMIZED Desk after payment. This response is not a Studio unlock.",
    desk: "https://anamized.grok.me",
    github: sku.github,
    explorer_pay_to: `https://basescan.org/address/${RECEIVE.evm}`,
    timestamp: new Date().toISOString(),
  };
  receipts.unshift(rec);
  if (receipts.length > RECEIPT_CAP) receipts.pop();
  return rec;
}

app.get("/", (c) => {
  return c.json({
    name: "ANAMIZED x402 agent checkout",
    status: "online",
    protocol: "x402",
    networks: ["Base Mainnet (eip155:8453)", "Solana Mainnet"],
    rails: {
      x402: "USDC exact on Base + Solana — agents preferred",
      stripe: "hosted Payment Links — humans preferred",
    },
    primary_network: "Base Mainnet (eip155:8453)",
    endpoints: {
      "GET /": "Free — health & rails",
      "GET /health": "Free — liveness",
      "GET /demo": "Free — 60-second paywall demo",
      "GET /v1/catalog": "Free — SKUs with x402 paths + live Stripe links",
      "GET /v1/receipts": "Free — recent receipt ledger (in-memory)",
      "GET /v1/cycle": "$0.75 USDC — Agentic OS Cycle",
      "GET /v1/search": "$0.40 USDC — OpenGOS Advanced Search",
      "GET /v1/draft": "$2.50 USDC — OpenGOS Proposal Draft",
      "GET /v1/trading": "$4.00 USDC — Agentic Trading Decision Cycle",
      "GET /weather": "$0.01 USDC — starter example",
    },
    docs: "https://github.com/ANAMIZED/x402-cloudflare-starter",
    desk: "https://anamized.grok.me",
    message: "Bring your own wallets. No Coinbase account required. Host owns fulfillment.",
  });
});

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    primary_network: NETWORKS.base,
    timestamp: new Date().toISOString(),
  });
});

app.get("/demo", (c) => c.html(DEMO_HTML));

app.get("/v1/receipts", (c) => {
  return c.json({
    protocol: "x402",
    primary_network: NETWORKS.base,
    pay_to_base: RECEIVE.evm,
    count: receipts.length,
    receipts,
  });
});

app.get("/v1/catalog", (c) => {
  return c.json({
    protocol: "x402",
    fulfillment: "receipt-only",
    receive_documented: {
      evm_base_eth: "0xD3d0E9eDAe3Ac7bb199a8EAA761BdA423b878438",
      solana: "ETQwWf19axArsY493UfC6bxe2BmEzmzvCb58PPnC38A",
      usdc_base: BASE_USDC,
      primary_network: NETWORKS.base,
      note: "Default payTo is the documented Base receive EOA. Secrets override.",
    },
    skus: SKUS.map((s) => ({
      id: s.id,
      path: `GET ${s.path}`,
      price_usdc: s.price,
      unit: s.unit,
      description: s.description,
      stripe: s.stripe,
      github: s.github,
    })),
  });
});

async function requirePayment(
  c: Parameters<typeof app.use>[1] extends infer _ ? any : never,
  path: string,
  next: () => Promise<void>
) {
  const sku = skuByPath(path);
  const baseAddress = resolvePayTo(c.env.BASE_ADDRESS, RECEIVE.evm);
  const solanaAddress = resolvePayTo(c.env.SOLANA_ADDRESS, RECEIVE.solana);

  if (!sku) {
    return c.json({ error: "unknown_sku", path }, 404);
  }
  if (!baseAddress || !solanaAddress) {
    return c.json(
      {
        error: "Server misconfigured",
        message: "BASE_ADDRESS and SOLANA_ADDRESS must be set as wrangler secrets",
        stripe_fallback: sku.stripe,
      },
      500
    );
  }

  const facilitatorClient = new HTTPFacilitatorClient(facilitator);
  const resourceServer = new x402ResourceServer(facilitatorClient)
    .register(NETWORKS.base, new ExactEvmScheme())
    .register(NETWORKS.solana, new ExactSvmScheme());

  const middleware = paymentMiddleware(
    {
      [`GET ${sku.path}`]: {
        accepts: accepts(sku, baseAddress, solanaAddress),
        description: sku.description,
        mimeType: "application/json",
      },
    },
    resourceServer
  );

  return middleware(c, next);
}

for (const sku of SKUS) {
  app.use(sku.path, async (c, next) => requirePayment(c, sku.path, next));
  app.get(sku.path, (c) => c.json(receipt(sku)));
}

app.use("/weather", async (c, next) => {
  const baseAddress = resolvePayTo(c.env.BASE_ADDRESS, RECEIVE.evm);
  const solanaAddress = resolvePayTo(c.env.SOLANA_ADDRESS, RECEIVE.solana);
  if (!baseAddress || !solanaAddress) {
    return c.json(
      {
        error: "Server misconfigured",
        message: "BASE_ADDRESS and SOLANA_ADDRESS must be set as secrets",
      },
      500
    );
  }
  const facilitatorClient = new HTTPFacilitatorClient(facilitator);
  const resourceServer = new x402ResourceServer(facilitatorClient)
    .register(NETWORKS.base, new ExactEvmScheme())
    .register(NETWORKS.solana, new ExactSvmScheme());
  const middleware = paymentMiddleware(
    {
      "GET /weather": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.01",
            network: NETWORKS.base,
            payTo: baseAddress,
          },
          {
            scheme: "exact",
            price: "$0.01",
            network: NETWORKS.solana,
            payTo: solanaAddress,
          },
        ],
        description: "Current weather data",
        mimeType: "application/json",
      },
    },
    resourceServer
  );
  return middleware(c, next);
});

app.get("/weather", (c) => {
  return c.json({
    weather: "sunny",
    temperature: 72,
    location: "San Francisco",
    unit: "fahrenheit",
    message: "Payment received via x402. Thank you!",
    paid: true,
    timestamp: new Date().toISOString(),
  });
});

export default app;
