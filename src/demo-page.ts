export const DEMO_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>ANAMIZED x402 — 60s Base merchant demo</title>
<style>
  :root { --bg:#0A0B0D; --fg:#E8EAED; --muted:#9AA0A6; --acc:#0052FF; --ok:#3DDC97; --pay:#FF6B4A; }
  * { box-sizing:border-box; }
  body { margin:0; font:15px/1.45 ui-sans-serif,system-ui; background:var(--bg); color:var(--fg); }
  main { max-width:880px; margin:0 auto; padding:28px 20px 64px; }
  h1 { font-size:28px; letter-spacing:-.03em; margin:0 0 8px; }
  .sub { color:var(--muted); margin:0 0 24px; }
  .grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  @media (max-width:720px){ .grid { grid-template-columns:1fr; } }
  button, .card { background:#14161A; border:1px solid #2A2E35; border-radius:12px; }
  button { color:var(--fg); padding:12px 14px; cursor:pointer; text-align:left; }
  button:hover { border-color:var(--acc); }
  .card { padding:14px 16px; overflow:auto; }
  pre { margin:0; white-space:pre-wrap; word-break:break-word; font:12px/1.4 ui-monospace,monospace; color:#C5CAD3; }
  .pill { display:inline-block; padding:2px 8px; border-radius:999px; font-size:11px; margin-right:6px; }
  .base { background:#0052FF22; color:#7FB0FF; }
  .pay { background:#FF6B4A22; color:#FF8A70; }
  .ok { background:#3DDC9722; color:#3DDC97; }
  ol { color:var(--muted); padding-left:18px; }
</style>
</head>
<body>
<main>
  <h1>ANAMIZED · Base-first x402 merchant</h1>
  <p class="sub">60-second demo. Unpaid SKU calls return HTTP 402. A verified payment returns a receipt. Settlement default: USDC on Base.</p>
  <p>
    <span class="pill base">eip155:8453</span>
    <span class="pill pay">HTTP 402</span>
    <span class="pill ok">receipt-only fulfillment</span>
  </p>
  <ol>
    <li>Catalog is free.</li>
    <li>Hit a SKU with no payment header → 402 PAYMENT-REQUIRED.</li>
    <li>Pay exact USDC on Base (or Stripe for humans) → 200 receipt JSON.</li>
    <li>Receipt does not unlock Desk Studio. Host owns entitlements.</li>
  </ol>
  <div class="grid" style="margin:18px 0">
    <button onclick="go('/v1/catalog')">GET /v1/catalog (free)</button>
    <button onclick="go('/v1/cycle')">GET /v1/cycle $0.75 (expect 402)</button>
    <button onclick="go('/v1/search')">GET /v1/search $0.40 (expect 402)</button>
    <button onclick="go('/v1/receipts')">GET /v1/receipts</button>
  </div>
  <div class="card"><pre id="out">Ready. Click a path.</pre></div>
</main>
<script>
async function go(path){
  const out = document.getElementById('out');
  out.textContent = '→ '+path;
  const res = await fetch(path, { headers:{ Accept:'application/json' }});
  const body = await res.text();
  out.textContent = 'HTTP '+res.status+' '+res.statusText+'\\n'+
    [...res.headers.entries()].filter(([k])=>/payment|www-authenticate|content-type/i.test(k)).map(([k,v])=>k+': '+v).join('\\n')+
    '\\n\\n'+body;
}
</script>
</body>
</html>`;
