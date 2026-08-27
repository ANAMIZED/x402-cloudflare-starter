# x402 Cloudflare Starter

**The simplest way to accept USDC payments on Base + Solana using x402.** Bring your own wallets. No Coinbase account required.

This repo is the **agent checkout rail** for ANAMIZED first-dollar SKUs. Humans use Stripe Payment Links. Agents use x402. Same prices. Host owns fulfillment.

**Base is the default settlement network** (`eip155:8453`, USDC `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`). Solana is an optional parallel.

## Surfaces

| Surface | Entry |
|---------|-------|
| **API (Worker)** | `src/index.ts` |
| **60s demo** | `GET /demo` |
| **Receipt ledger** | `GET /v1/receipts` |
| **SKU catalog** | `src/catalog.ts` + `GET /v1/catalog` |
| **MCP Server** | `mcp/server.ts` |
| **Application pack** | `docs/APPLICATION_PACK.md` |

## Agent checkout (hybrid)

Free: `GET /` · `GET /health` · `GET /demo` · `GET /v1/catalog` · `GET /v1/receipts`

| SKU | x402 | Stripe (human) |
|-----|------|----------------|
| Agentic OS Cycle $0.75 | `GET /v1/cycle` | [Stripe](https://buy.stripe.com/3cI14o8R8dXD3p3frO43S04) |
| OpenGOS Search $0.40 | `GET /v1/search` | [Stripe](https://buy.stripe.com/7sY8wQ5EW3iZ5xb5Re43S06) |
| OpenGOS Draft $2.50 | `GET /v1/draft` | [Stripe](https://buy.stripe.com/9B69AUd7o7zf2kZ2F243S03) |
| Trading Decision Cycle $4.00 | `GET /v1/trading` | [Stripe](https://buy.stripe.com/bJedRaebsaLr2kZ2F243S05) |

Paid handlers return a **receipt only**. They do not unlock Desk Studio. Trading receipts are not live execution.

Documented receive addresses:

| Network | Address |
|---------|---------|
| Base / Ethereum | `0xD3d0E9eDAe3Ac7bb199a8EAA761BdA423b878438` |
| Solana | `ETQwWf19axArsY493UfC6bxe2BmEzmzvCb58PPnC38A` |

## Quick Start

```bash
npm install
npx wrangler secret put BASE_ADDRESS
npx wrangler secret put SOLANA_ADDRESS
npx wrangler deploy
```

## License

MIT
