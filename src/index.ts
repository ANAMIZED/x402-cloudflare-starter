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
 * Free endpoints
 */
app.get("/", (c) => {
  return c.json({
    name: "x402 Cloudflare Starter",
    status: "online",
    protocol: "x402",
    networks: ["Base Mainnet (eip155:8453)", "Solana Mainnet"],
    endpoints: {
      "GET /": "Free - Health & info",
      "GET /weather": "$0.01 USDC - Example paid endpoint",
    },
    docs: "https://github.com/ANAMIZED/x402-cloudflare-starter",
    message: "Bring your own wallets. No Coinbase account required.",
  });
});

app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

/**
 * x402 Payment Middleware
 * Applied only to paid routes
 */
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
 * Paid endpoint example
 */
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
