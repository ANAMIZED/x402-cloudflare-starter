# AGENTS.md

This repository is an **x402 payment starter** for Cloudflare Workers.

## What this project does

It lets anyone accept **USDC micropayments** on **Base Mainnet** and **Solana Mainnet** using the open x402 protocol — without requiring a Coinbase account.

Users bring their own wallet addresses. Payments are verified via the PayAI facilitator.

## Key files

| Path | Purpose |
|------|--------|
| `src/index.ts` | Main Cloudflare Worker (Hono + x402 middleware) |
| `scripts/test-client.ts` | Auto-paying test client |
| `wrangler.toml` | Cloudflare Workers configuration |
| `mcp/server.ts` | MCP server for agent discovery & tooling |

## Conventions

- Runtime: **Cloudflare Workers** + Hono
- Payments: **x402** protocol (`exact` scheme)
- Networks: Base (`eip155:8453`) + Solana (`solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp`)
- Facilitator: PayAI (`@payai/facilitator`) — no API key required on free tier
- Secrets are set via `wrangler secret put` (never commit real addresses or keys)

## How to extend

To add a new paid endpoint:

1. Add a new entry inside the `paymentMiddleware` config in `src/index.ts`
2. Create the corresponding route handler
3. Keep free routes outside the middleware

## Boundaries

- Do **not** hardcode real wallet addresses or private keys
- Do **not** switch the default facilitator to CDP unless the user explicitly wants Coinbase
- Prefer keeping the codebase minimal and readable

## Useful commands

```bash
npm run dev          # Local development
npm run deploy       # Deploy to Cloudflare
npx wrangler secret put BASE_ADDRESS
npx wrangler secret put SOLANA_ADDRESS
```

## Related standards

- [x402 Protocol](https://x402.org)
- [PayAI Facilitator](https://docs.payai.network)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
