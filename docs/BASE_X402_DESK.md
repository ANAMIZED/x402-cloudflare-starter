# Base x402 on anamized.grok.me

Status after 2026-08-26 audit: **protocol wired, on-chain dark**.

Live `GET https://anamized.grok.me/api/v1/x402` already names:

- network `eip155:8453`
- asset `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (native USDC on Base)
- `usdcAtomic` amounts `750000` / `400000` / `2500000`
- `rails.usdc.live = false` because `payTo` is null

On-chain turns on when the Vercel deployment sets:

```
X402_PAYTO_ADDRESS=0xD3d0E9eDAe3Ac7bb199a8EAA761BdA423b878438
X402_NETWORK=eip155:8453
X402_ASSET=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
X402_FACILITATOR_URL=<PayAI or CDP facilitator>
```

Use the documented receive EOA only if that wallet is actually controlled. Do not invent a facilitator receipt.

After the env is set and the app is redeployed:

1. `rails.usdc.live` must be `true`
2. unpaid `POST /api/v1/x402/compute` `accepts[]` must include `network: "base"`
3. forged `PAYMENT-SIGNATURE` must still 402
4. a real Base USDC exact payment settled by the facilitator unlocks one SKU run

Desk credit (claimed Bearer) and Stripe stay live either way.

This worker (`x402-cloudflare-starter`) is the agent rail. It already defaults `BASE_ADDRESS` to the documented Base EOA and charges the same three SKUs. It returns a receipt only; the desk still owns Studio fulfillment.
