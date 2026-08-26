# Glama release — x402-cloudflare-starter

Do **not** run `npm install` at the repo root and do **not** CMD `wrangler`.

## Admin form

| Field | Value |
| --- | --- |
| Base image | node 22 |
| Build steps | `["npm install --omit=dev --ignore-scripts --prefix mcp"]` |
| CMD arguments | `["mcp/node_modules/.bin/tsx", "mcp/stdio.ts"]` |
| Placeholders | `{}` |
