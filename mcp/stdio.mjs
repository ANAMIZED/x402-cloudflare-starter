#!/usr/bin/env node
/** Glama stdio entry — Node 26 on debian:trixie-slim. No tsx required. */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "x402-cloudflare-starter",
  version: "1.3.0",
  description:
    "ANAMIZED agent checkout: USDC micropayments on Base + Solana via x402, parallel to live Stripe Payment Links.",
});

server.tool(
  "explain_x402_starter",
  "Explain how this x402 Cloudflare Worker accepts USDC on Base and Solana, which SKUs are paid, and how it parallels live Stripe Payment Links. Use this first when an agent needs architecture context. Do not use it to list SKU prices (list_agent_skus) or supported chains (get_supported_networks). Read-only documentation; no chain calls, no payment, no deploy.",
  {},
  async () => ({
    content: [
      {
        type: "text",
        text: "ANAMIZED x402 agent checkout on Cloudflare Workers. USDC on Base (eip155:8453) and Solana. Paid: /v1/cycle $0.75, /v1/search $0.40, /v1/draft $2.50. Free: /health /v1/catalog. Repo: https://github.com/ANAMIZED/x402-cloudflare-starter",
      },
    ],
  }),
);

server.tool(
  "list_agent_skus",
  "Return the hybrid x402 + Stripe first-dollar SKU catalog. Use when choosing a product. Read-only local catalog; does not create a charge.",
  {},
  async () => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            fulfillment: "receipt-only",
            skus: [
              { id: "os-cycle", x402: "GET /v1/cycle", price: "$0.75" },
              { id: "opengos-search", x402: "GET /v1/search", price: "$0.40" },
              { id: "opengos-draft", x402: "GET /v1/draft", price: "$2.50" },
            ],
          },
          null,
          2,
        ),
      },
    ],
  }),
);

server.tool(
  "get_supported_networks",
  "Return Base Mainnet and Solana Mainnet USDC networks plus the PayAI facilitator. Read-only; no wallet secrets.",
  {},
  async () => ({
    content: [
      {
        type: "text",
        text: JSON.stringify({
          networks: [
            { name: "Base Mainnet", caip2: "eip155:8453", asset: "USDC" },
            { name: "Solana Mainnet", caip2: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp", asset: "USDC" },
          ],
          facilitator: "PayAI",
        }),
      },
    ],
  }),
);

server.tool(
  "generate_paid_endpoint",
  "Generate a TypeScript snippet that adds a new x402-gated GET route. Does not deploy. Output is code only.",
  {
    path: z.string().describe("Route path including leading slash. Example: /premium-data"),
    price: z.string().describe("USD price string. Example: $0.05"),
    description: z.string().describe("Payment requirement description shown to agents."),
  },
  async ({ path, price, description }) => ({
    content: [
      {
        type: "text",
        text: `GET ${path} @ ${price} — ${description}`,
      },
    ],
  }),
);

server.tool(
  "get_deployment_instructions",
  "Return wrangler deploy steps. Does not run wrangler or write secrets. Read-only docs.",
  {},
  async () => ({
    content: [
      {
        type: "text",
        text: "git clone https://github.com/ANAMIZED/x402-cloudflare-starter.git && npm install && wrangler secret put BASE_ADDRESS && wrangler secret put SOLANA_ADDRESS && npm run deploy",
      },
    ],
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);
