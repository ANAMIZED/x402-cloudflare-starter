import { Hono } from "hono";
import { paymentMiddleware, x402ResourceServer } from "@x402/hono";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { ExactSvmScheme } from "@x402/svm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { facilitator } from "@payai/facilitator";
import { NETWORKS, SKUS, skuByPath, type Sku } from "./catalog";

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

function receipt(sku: Sku) {
  return {
    paid: true,
    protocol: "x402",
    sku: sku.id,
    unit: sku.unit,
    price: sku.price,
    asset: "USDC",
    networks: ["eip155:8453", "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"],
    stripe_parallel: sku.stripe,
    fulfillment: "receipt-only",
    note: "Host owns entitlements. Sync on ANAMIZED Desk after payment. This response is not a Studio unlock.",
    desk: "https://anamized.grok.me",
    github: sku.github,
    timestamp: new Date().toISOString(),
  };
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
    endpoints: {
      "GET /": "Free — health & rails",
      "GET /health": "Free — liveness",
      "GET /v1/catalog": "Free — SKUs with x402 paths + live Stripe links",
      "GET /v1/cycle": "$0.75 USDC — Agentic OS Cycle",
      "GET /v1/search": "$0.40 USDC — OpenGOS Advanced Search",
      "GET /v1/draft": "$2.50 USDC — OpenGOS Proposal Draft",
      "GET /weather": "$0.01 USDC — starter example",
    },
    docs: "https://github.com/ANAMIZED/x402-cloudflare-starter",
    desk: "https://anamized.grok.me",
    message: "Bring your own wallets. No Coinbase account required. Host owns fulfillment.",
  });
});

app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/v1/catalog", (c) => {
  return c.json({
    protocol: "x402",
    fulfillment: "receipt-only",
    receive_documented: {
      evm_base_eth: "0xD3d0E9eDAe3Ac7bb199a8EAA761BdA423b878438",
      solana: "ETQwWf19axArsY493UfC6bxe2BmEzmzvCb58PPnC38A",
      note: "Worker payTo is BASE_ADDRESS / SOLANA_ADDRESS secrets, not this file.",
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
  const baseAddress = c.env.BASE_ADDRESS;
  const solanaAddress = c.env.SOLANA_ADDRESS;

  if (!sku) {
    return c.json({ error: "unknown_sku", path }, 404);
  }
  if (!baseAddress || !solanaAddress || baseAddress.startsWith("0xYour") || solanaAddress.startsWith("YourSolana")) {
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
  const baseAddress = c.env.BASE_ADDRESS;
  const solanaAddress = c.env.SOLANA_ADDRESS;
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
