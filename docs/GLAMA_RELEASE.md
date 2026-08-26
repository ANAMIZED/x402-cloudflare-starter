# Glama admin — x402-cloudflare-starter

The form fields must not stay `[]`. Glama generates debian:trixie-slim + Node 26 + mcp-proxy.

## Build steps

```json
["npm install --omit=dev --ignore-scripts --prefix mcp"]
```

## CMD arguments

```json
["node", "mcp/stdio.mjs"]
```

Env schema: `{\"type\":\"object\",\"properties\":{},\"required\":[]}`
Placeholders: `{}`

Do not `npm install` at repo root (@payai/facilitator 404s the build).
