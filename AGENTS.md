# AGENTS.md

This repository is the **ANAMIZED x402 agent checkout** for Cloudflare Workers.

## What this project does

It lets agents pay **USDC** on **Base Mainnet** and **Solana Mainnet** using x402 for the same first-dollar SKUs sold on Stripe:

- Agentic OS Cycle `$0.75` → `GET /v1/cycle`
- OpenGOS Advanced Search `$0.40` → `GET /v1/search`
- OpenGOS Proposal Draft `$2.50` → `GET /v1/draft`
- Agentic Trading Decision Cycle `$4.00` → `GET /v1/trading`

Humans keep using live Stripe Payment Links. Do not invent URLs.

Payments are verified via the PayAI facilitator. A 200 on a paid route is a **receipt**, not a Desk entitlement write. Trading receipts are not live execution.

## Key files

| Path | Purpose |
|------|--------|
| `src/catalog.ts` | Canonical SKU table (prices + Stripe parallels) |
| `src/index.ts` | Cloudflare Worker (Hono + x402 middleware) |
| `scripts/test-client.ts` | Auto-paying test client |
| `wrangler.toml` | Cloudflare Workers configuration |
| `mcp/server.ts` | MCP server for agent discovery & tooling |

## Conventions

- Runtime: **Cloudflare Workers** + Hono
- Payments: **x402** protocol (`exact` scheme)
- Networks: Base (`eip155:8453`) + Solana (`solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp`)
- Facilitator: PayAI (`@payai/facilitator`) — no API key required on free tier
- Secrets via `wrangler secret put` (never commit private keys)
- Fail-closed: misconfigured payTo → 500 + Stripe fallback link

## Boundaries

- Do **not** invent Stripe links or prices
- Do **not** claim a paid x402 call unlocks Studio / seats
- Do **not** claim `/v1/trading` executes live trades
- Do **not** switch the default facilitator to CDP unless the user explicitly wants Coinbase
- Prefer keeping the codebase minimal and readable

## Useful commands

```bash
npm run dev
npm run deploy
npx wrangler secret put BASE_ADDRESS
npx wrangler secret put SOLANA_ADDRESS
```
