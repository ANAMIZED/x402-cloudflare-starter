# x402 Cloudflare Starter

**The simplest, cleanest way to accept USDC payments on Base + Solana using the x402 protocol.**

- Bring your own wallets  
- No Coinbase account required  
- Powered by [PayAI](https://payai.network) facilitator  
- Optimized for Cloudflare Workers  
- Ready for mainnet  

---

## Features

- Accept payments on **Base Mainnet** and **Solana Mainnet**
- Uses your own receiving addresses
- Extremely minimal codebase
- One-command deploy to Cloudflare
- Free tier friendly

---

## Quick Start

### 1. Clone or Use as Template

```bash
git clone https://github.com/ANAMIZED/x402-cloudflare-starter.git
cd x402-cloudflare-starter
npm install
```

### 2. Set Your Wallet Addresses

```bash
npx wrangler secret put BASE_ADDRESS
npx wrangler secret put SOLANA_ADDRESS
```

Paste your real Base (`0x...`) and Solana addresses when prompted.

### 3. Deploy

```bash
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
