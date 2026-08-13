# x402 Cloudflare Starter

**The cleanest, most practical way to accept USDC micropayments on Base + Solana using the x402 protocol.**

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ANAMIZED/x402-cloudflare-starter)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![x402](https://img.shields.io/badge/x402-Protocol-green)](https://x402.org)
[![Base](https://img.shields.io/badge/Base-Mainnet-0052FF)](https://base.org)
[![Solana](https://img.shields.io/badge/Solana-Mainnet-9945FF)](https://solana.com)
[![MCP](https://img.shields.io/badge/MCP-Server-purple)](mcp/server.ts)

---

## Why this exists

Most x402 examples either force you into Coinbase CDP, are testnet-only, or are overly complex.

This starter is different:

- **Bring your own wallets** (Base + Solana)
- **No Coinbase account required**
- Uses the **PayAI facilitator** (free tier available)
- Optimized for **Cloudflare Workers**
- Production-ready for mainnet
- **Agent-discoverable** via `AGENTS.md` + MCP server
- Extremely minimal and readable

Built for the open source and crypto communities.

---

## Features

- Accept USDC on **Base Mainnet** + **Solana Mainnet**
- Your own receiving addresses
- One-click deploy to Cloudflare
- Easy to add new paid endpoints
- Clean separation of free vs paid routes
- Test client included
- **MCP server** for AI agent discovery
- `AGENTS.md` for coding agents
- MIT licensed

---

## Quick Start

### 1. Deploy with one click

Click the button above, then set these two secrets in the Cloudflare dashboard:

| Secret            | Example                          |
|-------------------|----------------------------------|
| `BASE_ADDRESS`    | `0xYourBaseWallet...`            |
| `SOLANA_ADDRESS`  | `YourSolanaWallet...`            |

### 2. Or deploy manually

```bash
git clone https://github.com/ANAMIZED/x402-cloudflare-starter.git
cd x402-cloudflare-starter
npm install

npx wrangler secret put BASE_ADDRESS
npx wrangler secret put SOLANA_ADDRESS

npm run deploy
```

Your endpoint will be live at:

```
https://x402-cloudflare-starter.<your-subdomain>.workers.dev/weather
```

---

## Agent Discoverability

This project is designed to be found and used by AI agents:

- **`AGENTS.md`** — Tells coding agents how the repo works
- **`mcp/server.ts`** — MCP server with tools for explaining, generating endpoints, and deployment help

Agents can use the MCP tools to:
- Understand the starter
- Generate new paid endpoint code
- Get deployment instructions
- List supported networks

---

## How x402 works (simple version)

1. Client requests a paid resource → `/weather`
2. Server responds with **HTTP 402 Payment Required** + payment details
3. Client pays in USDC on Base or Solana
4. Client retries the request with a payment proof
5. Server verifies the payment via facilitator and returns the data

No accounts. No API keys. No sessions.

---

## Project Structure

```
├── src/
│   └── index.ts          # Main Worker (Hono + x402)
├── mcp/
│   └── server.ts         # MCP server for AI agents
├── scripts/
│   └── test-client.ts    # Auto-paying test client
├── AGENTS.md             # Guidance for coding agents
├── wrangler.toml
└── README.md
```

---

## Adding new paid endpoints

Edit `src/index.ts`. Example:

```ts
"GET /premium-data": {
  accepts: [
    {
      scheme: "exact",
      price: "$0.05",
      network: "eip155:8453",
      payTo: baseAddress,
    },
    {
      scheme: "exact",
      price: "$0.05",
      network: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
      payTo: solanaAddress,
    },
  ],
  description: "Premium market data",
  mimeType: "application/json",
},
```

Then add the route handler.

---

## Test Client

```bash
export EVM_PRIVATE_KEY=0x...
export SVM_PRIVATE_KEY=...   # base58

npx tsx scripts/test-client.ts https://your-worker.workers.dev/weather
```

---

## Security Notes

- Never commit private keys
- Use Cloudflare secrets for `BASE_ADDRESS` and `SOLANA_ADDRESS`
- Start with small amounts while testing
- The PayAI facilitator is used by default (no API key required on free tier)

---

## License

MIT

---

Built for the open source + crypto + agent ecosystems.
