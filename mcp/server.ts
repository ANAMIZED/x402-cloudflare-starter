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
  "Explain how this x402 Cloudflare Worker accepts USDC on Base and Solana, which SKUs are paid, and how it parallels live Stripe Payment Links. Use this first when an agent needs architecture context. Do not use it to list SKU prices (list_agent_skus) or supported chains (get_supported_networks). Read-only documentation; no chain calls, no payment, no deploy.",
  {},
  async () => {
    return {
      content: [
        {
          type: "text",
          text: `ANAMIZED x402 agent checkout on Cloudflare Workers.\n\nKey points:\n- Accepts USDC on Base Mainnet (eip155:8453) and Solana Mainnet\n- Uses Worker secrets BASE_ADDRESS + SOLANA_ADDRESS (no Coinbase / CDP required)\n- PayAI facilitator by default\n- Hybrid catalog: same SKUs as Stripe Payment Links\n\nPaid SKUs (receipt-only; host owns Desk fulfillment):\n- GET /v1/cycle  $0.75  Agentic OS Cycle\n- GET /v1/search $0.40  OpenGOS Advanced Search\n- GET /v1/draft  $2.50  OpenGOS Proposal Draft\n\nFree: GET / , GET /health , GET /v1/catalog\nExample: GET /weather $0.01\n\nStripe parallels:\n- Cycle https://buy.stripe.com/3cI14o8R8dXD3p3frO43S04\n- Search https://buy.stripe.com/7sY8wQ5EW3iZ5xb5Re43S06\n- Draft https://buy.stripe.com/9B69AUd7o7zf2kZ2F243S03\n\nRepo: https://github.com/ANAMIZED/x402-cloudflare-starter\nDesk: https://anamized.grok.me`,
        },
      ],
    };
  }
);

server.tool(
  "list_agent_skus",
  "Return the hybrid x402 + Stripe first-dollar SKU catalog (id, paid path, USD price, Stripe Payment Link). Use when an agent needs to choose a product to pay for. Not a network list (get_supported_networks) and not deploy docs (get_deployment_instructions). Read-only local catalog; does not create a charge.",
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
  "Return the blockchain networks this Worker accepts for x402 exact-scheme USDC payments (Base Mainnet eip155:8453 and Solana Mainnet), plus the default PayAI facilitator. Use before generating a paid route. Does not broadcast transactions. Read-only; no wallet secrets are returned.",
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
  "Generate a TypeScript snippet that adds a new x402-gated GET route to this Worker (middleware accept block + hono handler). Use when extending the catalog. This does not deploy or mutate wrangler.toml. Not a substitute for get_deployment_instructions. Output is code only — review before commit.",
  {
    path: z
      .string()
      .describe("Route path to gate, including the leading slash. Example: /premium-data"),
    price: z
      .string()
      .describe("Human USD price string used in the x402 accept block. Example: $0.05"),
    description: z
      .string()
      .describe("Short description stored on the payment requirement, shown to paying agents."),
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
  "Return step-by-step wrangler deploy instructions for this starter: clone, set BASE_ADDRESS and SOLANA_ADDRESS secrets, deploy, then test free /v1/catalog versus paid SKUs. Use when the user is shipping the Worker. Does not run wrangler and does not write secrets. Read-only docs.",
  {},
  async () => {
    return {
      content: [
        {
          type: "text",
          text: `Deployment Instructions:\n\n1. Clone the repo:\n   git clone https://github.com/ANAMIZED/x402-cloudflare-starter.git\n   cd x402-cloudflare-starter\n   npm install\n\n2. Set receiving wallet addresses as secrets:\n   npx wrangler secret put BASE_ADDRESS\n   npx wrangler secret put SOLANA_ADDRESS\n\n3. Deploy:\n   npm run deploy\n\n4. Test free catalog:\n   GET https://your-worker.workers.dev/v1/catalog\n\n5. Paid SKUs require an x402 client (see scripts/test-client.ts).\n   Humans can use the Stripe parallels instead.\n\nRepo: https://github.com/ANAMIZED/x402-cloudflare-starter`,
        },
      ],
    };
  }
);

export default server;
