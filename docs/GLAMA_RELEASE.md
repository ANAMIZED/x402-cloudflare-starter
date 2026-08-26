# Glama release — x402-cloudflare-starter

The Worker (`wrangler`) is not what Glama should run. Glama must run the
**stdio MCP catalog server** in `mcp/stdio.ts`.

## Repo surface

| Field | Value |
| --- | --- |
| CMD | `npx tsx mcp/stdio.ts` |
| Transport | MCP stdio |
| Secrets required to list tools | none (no wallet keys) |

## Admin UI

1. Sync https://glama.ai/mcp/servers/ANAMIZED/x402-cloudflare-starter
2. Base image: node 22
3. Build steps: leave empty if using the repo Dockerfile, or install MCP SDK + tsx only
4. CMD arguments: `["npx", "tsx", "mcp/stdio.ts"]`
5. Deploy → Make Release.

Do not point CMD at `wrangler`. That image will never answer `tools/list`.
