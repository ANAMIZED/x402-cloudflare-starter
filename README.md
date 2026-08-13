# x402 Cloudflare Starter

**The simplest, cleanest way to accept USDC payments on Base + Solana using the x402 protocol.**

- Bring your own wallets  
- No Coinbase account required  
- Powered by [PayAI](https://payai.network) facilitator  
- Optimized for Cloudflare Workers  
- Ready for mainnet  

---

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ANAMIZED/x402-cloudflare-starter)

---

## Features

- Accept payments on **Base Mainnet** and **Solana Mainnet**
- Uses your own receiving addresses
- Extremely minimal codebase
- One-command deploy to Cloudflare
- Free tier friendly

---

## Quick Start

### Option A — One-Click Deploy (Recommended)

Click the button above, then set these two secrets in the Cloudflare dashboard:

- `BASE_ADDRESS` → your Base wallet (`0x...`)
- `SOLANA_ADDRESS` → your Solana wallet

### Option B — Manual

```bash
git clone https://github.com/ANAMIZED/x402-cloudflare-starter.git
cd x402-cloudflare-starter
npm install

# Set your wallet addresses as secrets
npx wrangler secret put BASE_ADDRESS
npx wrangler secret put SOLANA_ADDRESS

# Deploy
npm run deploy
```

Your paid endpoint will be live at:

```
https://x402-cloudflare-starter.<your-subdomain>.workers.dev/weather
```

---

## Local Development

```bash
npm run dev
```

---

## Test Client

A simple script that automatically pays is included:

```bash
npx tsx scripts/test-client.ts https://your-worker.workers.dev/weather
```

Make sure you have funded private keys in your environment (for testing only).

---

## How it works

1. Client hits `/weather`
2. Server returns **HTTP 402** with payment requirements (Base + Solana)
3. Client pays in USDC
4. Client retries with payment proof
5. Server verifies via PayAI facilitator and returns the data

---

## Customization

Edit `src/index.ts` to:

- Change the price
- Add more endpoints
- Change the response data

---

## License

MIT — Free for everyone.

Built for the open source community.
