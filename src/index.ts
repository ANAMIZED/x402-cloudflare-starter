import { Hono } from "hono";
import { paymentMiddleware, x402ResourceServer } from "@x402/hono";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { ExactSvmScheme } from "@x402/svm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { facilitator } from "@payai/facilitator";

type Env = {
  BASE_ADDRESS: string;
  SOLANA_ADDRESS: string;
};

const app = new Hono<{ Bindings: Env }>();

/**
 * Health / info endpoint (free)
 */
app.get("/", (c) => {
  return c.json({
    name: "x402 Cloudflare Starter",
    status: "online",
    networks: ["Base Mainnet", "Solana Mainnet"],
    endpoints: {
      "GET /weather": "$0.01 USDC (Base or Solana)",
    },
    docs: "https://github.com/ANAMIZED/x402-cloudflare-starter",
  });
});

/**
 * Apply x402 payment middleware
 */
app.use("*", async (c, next) => {
  const baseAddress = c.env.BASE_ADDRESS;
  const solanaAddress = c.env.SOLANA_ADDRESS;

  if (!baseAddress || !solanaAddress) {
    return c.json(
      {
        error: "Missing required environment variables",
        required: ["BASE_ADDRESS", "SOLANA_ADDRESS"],
      },
      500
    );
  }

  const facilitatorClient = new HTTPFacilitatorClient(facilitator);

  const resourceServer = new x402ResourceServer(facilitatorClient)
    .register("eip155:8453", new ExactEvmScheme()) // Base Mainnet
    .register(
      "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
      new ExactSvmScheme()
    ); // Solana Mainnet

  const middleware = paymentMiddleware(
    {
      "GET /weather": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.01",
            network: "eip155:8453",
            payTo: baseAddress,
          },
          {
            scheme: "exact",
            price: "$0.01",
            network: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
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

/**
 * Paid endpoint
 */
app.get("/weather", (c) => {
  return c.json({
    weather: "sunny",
    temperature: 72,
    location: "San Francisco",
    message: "Payment received via x402. Thank you!",
    timestamp: new Date().toISOString(),
  });
});

export default app;
