# x402 Cloudflare Starter

[![CI](https://github.com/ANAMIZED/x402-cloudflare-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/ANAMIZED/x402-cloudflare-starter/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-server-purple.svg)](mcp/server.ts)
[![Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020.svg)](src/index.ts)
[![x402](https://img.shields.io/badge/x402-payments-green.svg)](https://x402.org)

**The simplest way to accept USDC payments on Base + Solana using x402.** Bring your own wallets. No Coinbase account required. Optimized for Cloudflare Workers + PayAI facilitator.

## Surfaces

| Surface | Entry |
|---------|-------|
| **API (Worker)** | `src/index.ts` |
| **MCP Server** | `mcp/server.ts` |
| **Client test** | `scripts/test-client.ts` |
| **CI** | `.github/workflows/ci.yml` |
| **AGENTS.md** | Agent contract |

> Multi-agent workflows and Python SDK/CLI are intentionally out of scope for this TypeScript starter; use [server-os](https://github.com/ANAMIZED/server-os) or [openmesha](https://github.com/ANAMIZED/openmesha) for full agentic OS surfaces.

## Quick Start

```bash
npm install
npx wrangler dev
```

## License

MIT
