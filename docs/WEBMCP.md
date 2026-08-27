# WebMCP and x402

Do **not** expose paid x402 routes as silent WebMCP tools.

Correct split:

- Desk WebMCP `checkout_link` → Stripe URL for humans (confirm).
- Agents paying USDC → call this Worker (`GET /v1/cycle` · `/v1/search` · `/v1/draft`) over MCP / HTTP.
- Cloudflare dashboard WebMCP preview may proxy `/mcp` if you host Streamable HTTP here. That still must not hide the 402 challenge.

A WebMCP tool on a catalog page may *describe* these SKUs. It must not settle payment without the x402 flow.
