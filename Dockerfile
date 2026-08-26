# Glama inspects the catalog MCP server over stdio.
# Do NOT npm-install the Worker graph (@payai/facilitator does not resolve).
# Admin generator: build ["npm install --omit=dev --ignore-scripts --prefix mcp"]
#                  CMD   ["mcp/node_modules/.bin/tsx", "mcp/stdio.ts"]
FROM node:22-alpine

WORKDIR /app

COPY mcp ./mcp

RUN cd mcp \
    && npm install --omit=dev --ignore-scripts --no-audit --no-fund \
    && chown -R node:node /app

USER node

CMD ["mcp/node_modules/.bin/tsx", "mcp/stdio.ts"]
