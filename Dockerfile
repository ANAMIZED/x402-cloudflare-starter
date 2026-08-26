# Glama / local stdio image for the x402 catalog MCP server.
# Intentionally does NOT install Worker payment packages (wrangler / x402 / PayAI).
# Those are not required to list tools and some pins do not resolve in a clean install.
FROM node:22-alpine

WORKDIR /app

COPY mcp ./mcp

RUN npm init -y >/dev/null 2>&1 \
    && npm install --ignore-scripts --no-audit --no-fund \
         @modelcontextprotocol/sdk@^1.12.0 zod@^3.24.0 tsx@^4.19.2

ENV NODE_ENV=production
USER node

CMD ["npx", "tsx", "mcp/stdio.ts"]
