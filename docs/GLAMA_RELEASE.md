# Glama admin — x402-cloudflare-starter

Glama generates FROM debian:trixie-slim and wraps CMD with mcp-proxy.

1. Sync Server. Pinned SHA empty.
2. Node.js version: 22 (or default)
3. Python version: unused
4. Build steps:

```json
["npm install --omit=dev --ignore-scripts --prefix mcp"]
```

5. CMD arguments:

```json
["mcp/node_modules/.bin/tsx", "mcp/stdio.ts"]
```

Do not npm install the Worker graph at repo root (@payai/facilitator does not resolve).

6. Env schema: `{\"type\":\"object\",\"properties\":{},\"required\":[]}`
7. Placeholders: `{}`
