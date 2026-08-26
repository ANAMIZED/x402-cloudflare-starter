# x402 Cloudflare Starter

[![CI](https://github.com/ANAMIZED/x402-cloudflare-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/ANAMIZED/x402-cloudflare-starter/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-server-purple.svg)](mcp/server.ts)
[![Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020.svg)](src/index.ts)
[![x402](https://img.shields.io/badge/x402-payments-green.svg)](https://x402.org)

**The simplest way to accept USDC payments on Base + Solana using x402.** Bring your own wallets. No Coinbase account required. Optimized for Cloudflare Workers + PayAI facilitator.

This repo is the **agent checkout rail** for ANAMIZED first-dollar SKUs. Humans use Stripe Payment Links. Agents use x402. Same prices. Host owns fulfillment.

## Surfaces

| Surface | Entry |
|---------|-------|
| **API (Worker)** | `src/index.ts` |
| **SKU catalog** | `src/catalog.ts` + `GET /v1/catalog` |
| **MCP Server** | `mcp/server.ts` |
| **Client test** | `scripts/test-client.ts` |
| **CI** | `.github/workflows/ci.yml` |
| **AGENTS.md** | Agent contract |

> Multi-agent workflows and Python SDK/CLI are intentionally out of scope for this TypeScript starter; use [server-os](https://github.com/ANAMIZED/server-os) or [openmesha](https://github.com/ANAMIZED/openmesha) for full agentic OS surfaces. Commerce routing from [SuperAgenticMCP](https://github.com/ANAMIZED/SuperAgenticMCP) points here.

## Agent checkout (hybrid)

Free: `GET /` · `GET /health` · `GET /v1/catalog`

| SKU | x402 | Stripe (human) |
|-----|------|----------------|
| Agentic OS Cycle $0.75 | `GET /v1/cycle` | [Stripe](https://buy.stripe.com/3cI14o8R8dXD3p3frO43S04) |
| OpenGOS Search $0.40 | `GET /v1/search` | [Stripe](https://buy.stripe.com/7sY8wQ5EW3iZ5xb5Re43S06) |
| OpenGOS Draft $2.50 | `GET /v1/draft` | [Stripe](https://buy.stripe.com/9B69AUd7o7zf2kZ2F243S03) |

Paid handlers return a **receipt only**. They do not write `fulfillment-claims.json` or unlock Desk Studio. Sync on [ANAMIZED Desk](https://anamized.grok.me) after payment.

Documented receive addresses (set the same values as Worker secrets):

| Network | Address |
|---------|---------|
| Base / Ethereum | `0xD3d0E9eDAe3Ac7bb199a8EAA761BdA423b878438` |
| Solana | `ETQwWf19axArsY493UfC6bxe2BmEzmzvCb58PPnC38A` |

## Quick Start

```bash
npm install
npx wrangler secret put BASE_ADDRESS
npx wrangler secret put SOLANA_ADDRESS
npx wrangler dev
# GET http://127.0.0.1:8787/v1/catalog
```

## License

MIT
