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
  version: "1.1.0",
  description:
    "Tools and knowledge for accepting USDC micropayments on Base + Solana using the x402 protocol on Cloudflare Workers. Bring your own wallets. No Coinbase account required.",
});

/**
 * Tool: Explain how x402 works in this starter
 */
server.tool(
  "explain_x402_starter",
  "Explains how this x402 Cloudflare starter works and how to use it",
  {},
  async () => {
    return {
      content: [
        {
          type: "text",
          text: `This is a minimal x402 payment starter for Cloudflare Workers.

Key points:
- Accepts USDC on Base Mainnet (eip155:8453) and Solana Mainnet
- Uses your own wallet addresses (BASE_ADDRESS + SOLANA_ADDRESS)
- No Coinbase / CDP account required
- Uses the PayAI facilitator by default
- Optimized for Cloudflare Workers + Hono

Main endpoint example: GET /weather costs $0.01 USDC

To deploy:
1. Set secrets: BASE_ADDRESS and SOLANA_ADDRESS
2. Run: npm run deploy

Repo: https://github.com/ANAMIZED/x402-cloudflare-starter`,
        },
      ],
    };
  }
);

/**
 * Tool: Get supported networks
 */
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

/**
 * Tool: Generate a new paid endpoint snippet
 */
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

/**
 * Tool: Get deployment instructions
 */
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

2. Set your receiving wallet addresses as secrets:
   npx wrangler secret put BASE_ADDRESS
   npx wrangler secret put SOLANA_ADDRESS

3. Deploy:
   npm run deploy

4. Test:
   Visit https://your-worker.workers.dev/
   Then try the paid endpoint: /weather

Optional: Use the one-click Deploy to Cloudflare button in the README.`,
        },
      ],
    };
  }
);

export default server;
