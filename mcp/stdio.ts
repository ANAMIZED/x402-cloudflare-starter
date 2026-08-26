/**
 * Stdio transport for the x402 Cloudflare Starter MCP server.
 * Glama and local clients launch this file; the Worker remains wrangler-only.
 */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import server from "./server";

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("x402 MCP stdio failed:", err);
  process.exit(1);
});
