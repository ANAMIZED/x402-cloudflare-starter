/**
 * x402 Cloudflare Starter — MCP Server
 *
 * Makes this project discoverable and usable by AI agents.
 * Exposes tools that help agents understand and work with x402 payments.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({
  name: "x402-cloudflare-starter",
  version: "1.3.0",
  description:
    "ANAMIZED agent checkout: USDC micropayments on Base + Solana via x402, parallel to live Stripe Payment Links. Cycle $0.75, Search $0.40, Draft $2.50.",
});

server.tool(
  "explain_x402_starter",
  "Explains how this x402 Cloudflare starter works and how to use it",
  {},
  async () => {
    return {
      content: [
        {
          type: "text",
          text: `ANAMIZED x402 agent checkout on Cloudflare Workers.

Key points:
- Accepts USDC on Base Mainnet (eip155:8453) and Solana Mainnet
- Uses Worker secrets BASE_ADDRESS + SOLANA_ADDRESS (no Coinbase / CDP required)
- PayAI facilitator by default
- Hybrid catalog: same SKUs as Stripe Payment Links

Paid SKUs (receipt-only; host owns Desk fulfillment):
- GET /v1/cycle  $0.75  Agentic OS Cycle
- GET /v1/search $0.40  OpenGOS Advanced Search
- GET /v1/draft  $2.50  OpenGOS Proposal Draft

Free: GET / , GET /health , GET /v1/catalog
Example: GET /weather $0.01

Stripe parallels:
- Cycle https://buy.stripe.com/3cI14o8R8dXD3p3frO43S04
- Search https://buy.stripe.com/7sY8wQ5EW3iZ5xb5Re43S06
- Draft https://buy.stripe.com/9B69AUd7o7zf2kZ2F243S03

Repo: https://github.com/ANAMIZED/x402-cloudflare-starter
Desk: https://anamized.grok.me`,
        },
      ],
    };
  }
);

server.tool(
  "list_agent_skus",
  "Returns the hybrid x402 + Stripe first-dollar SKU catalog",
  {},
  async () => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              fulfillment: "receipt-only",
              skus: [
                {
                  id: "os-cycle",
                  x402: "GET /v1/cycle",
                  price: "$0.75",
                  stripe: "https://buy.stripe.com/3cI14o8R8dXD3p3frO43S04",
                },
                {
                  id: "opengos-search",
                  x402: "GET /v1/search",
                  price: "$0.40",
                  stripe: "https://buy.stripe.com/7sY8wQ5EW3iZ5xb5Re43S06",
                },
                {
                  id: "opengos-draft",
                  x402: "GET /v1/draft",
                  price: "$2.50",
                  stripe: "https://buy.stripe.com/9B69AUd7o7zf2kZ2F243S03",
                },
              ],
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.tool(
  "get_supported_networks",
  "Returns the blockchain networks supported by this x402 starter",
  {},
  async () => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              networks: [
                {
                  name: "Base Mainnet",
                  caip2: "eip155:8453",
                  asset: "USDC",
                  status: "production",
                },
                {
                  name: "Solana Mainnet",
                  caip2: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
                  asset: "USDC",
                  status: "production",
                },
              ],
              facilitator: "PayAI (https://facilitator.payai.network)",
              requiresCoinbaseAccount: false,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.tool(
  "generate_paid_endpoint",
  "Generates a code snippet for a new x402 paid endpoint",
  {
    path: z.string().describe("The route path, e.g. /premium-data"),
    price: z.string().describe("Price in USD, e.g. $0.05"),
    description: z.string().describe("What the endpoint returns"),
  },
  async ({ path, price, description }) => {
    const snippet = `
// 1. Add this inside the paymentMiddleware config:
"GET ${path}": {
  accepts: [
    {
      scheme: "exact",
      price: "${price}",
      network: "eip155:8453",
      payTo: baseAddress,
    },
    {
      scheme: "exact",
      price: "${price}",
      network: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
      payTo: solanaAddress,
    },
  ],
  description: "${description}",
  mimeType: "application/json",
},

// 2. Add the route handler:
app.get("${path}", (c) => {
  return c.json({
    message: "Payment received",
    // your data here
  });
});
`.trim();

    return {
      content: [
        {
          type: "text",
          text: snippet,
        },
      ],
    };
  }
);

server.tool(
  "get_deployment_instructions",
  "Returns step-by-step instructions to deploy this x402 starter",
  {},
  async () => {
    return {
      content: [
        {
          type: "text",
          text: `Deployment Instructions:

1. Clone the repo:
   git clone https://github.com/ANAMIZED/x402-cloudflare-starter.git
   cd x402-cloudflare-starter
   npm install

2. Set receiving wallet addresses as secrets:
   npx wrangler secret put BASE_ADDRESS
   npx wrangler secret put SOLANA_ADDRESS

3. Deploy:
   npm run deploy

4. Test free catalog:
   GET https://your-worker.workers.dev/v1/catalog

5. Paid SKUs require an x402 client (see scripts/test-client.ts).
   Humans can use the Stripe parallels instead.

Repo: https://github.com/ANAMIZED/x402-cloudflare-starter`,
        },
      ],
    };
  }
);

export default server;
