/**
 * Desk-compatible Base x402 surface for anamized.grok.me.
 *
 * Live production currently advertises rails.usdc.live=false until
 * X402_PAYTO_ADDRESS is set. This module is the exact accept[] builder
 * the desk should emit once that env is present.
 *
 * Fail-closed: never invent a facilitator receipt. Never advertise
 * network=base when payTo is missing.
 */

export const BASE_CAIP2 = "eip155:8453";
export const BASE_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
export const DOCUMENTED_PAYTO = "0xD3d0E9eDAe3Ac7bb199a8EAA761BdA423b878438";

export type RackSku = {
  id: "compute" | "memory" | "reasoning";
  name: string;
  description: string;
  deskCents: number;
  typicalCents: number;
  unit: string;
  offerId: string;
  checkout: string;
  usdcAtomic: string;
  resourcePath: string;
};

export const RACK: RackSku[] = [
  {
    id: "compute",
    name: "Compute",
    description: "Governed kernel cycle. Desk rate.",
    deskCents: 75,
    typicalCents: 400,
    unit: "cycle",
    offerId: "os-cycle",
    checkout: "https://buy.stripe.com/3cI14o8R8dXD3p3frO43S04",
    usdcAtomic: "750000",
    resourcePath: "/api/v1/x402/compute",
  },
  {
    id: "memory",
    name: "Memory",
    description: "Recall and durable notes. Desk rate.",
    deskCents: 40,
    typicalCents: 200,
    unit: "recall",
    offerId: "opengos-search",
    checkout: "https://buy.stripe.com/7sY8wQ5EW3iZ5xb5Re43S06",
    usdcAtomic: "400000",
    resourcePath: "/api/v1/x402/memory",
  },
  {
    id: "reasoning",
    name: "Reasoning",
    description: "Grounded pass. Desk rate.",
    deskCents: 250,
    typicalCents: 1500,
    unit: "pass",
    offerId: "opengos-draft",
    checkout: "https://buy.stripe.com/9B69AUd7o7zf2kZ2F243S03",
    usdcAtomic: "2500000",
    resourcePath: "/api/v1/x402/reasoning",
  },
];

export type X402Env = {
  origin: string;
  payTo?: string | null;
  facilitator?: string | null;
};

function originOf(env: X402Env): string {
  return env.origin.replace(/\/$/, "");
}

function payToLive(payTo?: string | null): string | null {
  if (!payTo) return null;
  const trimmed = payTo.trim();
  if (!trimmed) return null;
  if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) return null;
  return trimmed;
}

export function discover(env: X402Env) {
  const payTo = payToLive(env.payTo);
  const origin = originOf(env);
  return {
    x402Version: 1,
    store: "ANAMIZED Desk",
    resources: RACK.map((sku) => ({
      id: sku.id,
      name: sku.name,
      resource: `${origin}${sku.resourcePath}`,
      description: sku.description,
      mimeType: "application/json",
      deskCents: sku.deskCents,
      typicalCents: sku.typicalCents,
      savePct: Math.round((1 - sku.deskCents / sku.typicalCents) * 100),
      unit: sku.unit,
      offerId: sku.offerId,
      checkout: sku.checkout,
      usdcAtomic: sku.usdcAtomic,
    })),
    rails: {
      deskCredit: {
        live: true,
        auth: "Authorization: Bearer <api_key>",
        note: "Claimed agent spends the owner's seat or matching metered credit.",
      },
      stripe: {
        live: true,
        note: "Human payment links. After pay, owner syncs on Account. Not a facilitator signature.",
      },
      usdc: {
        live: Boolean(payTo),
        network: BASE_CAIP2,
        asset: BASE_USDC,
        payTo,
        facilitator: payTo ? env.facilitator ?? null : null,
        note: payTo
          ? "Base mainnet USDC exact scheme is live."
          : "Pay-to address is not configured. 402 still advertises desk credits and Stripe. On-chain turns on when X402_PAYTO_ADDRESS is set.",
      },
    },
    flow: ["DISCOVER", "402 PAYMENT REQUIRED", "PAY", "RETRY", "GET RESULTS"],
  };
}

export function paymentRequired(sku: RackSku, env: X402Env) {
  const origin = originOf(env);
  const resource = `${origin}${sku.resourcePath}`;
  const payTo = payToLive(env.payTo);
  const accepts: Record<string, unknown>[] = [
    {
      scheme: "exact",
      network: "desk",
      maxAmountRequired: String(sku.deskCents),
      resource,
      description: sku.description,
      mimeType: "application/json",
      payTo: "anamized-desk",
      maxTimeoutSeconds: 120,
      asset: "usd-cents",
      extra: {
        rail: "desk-credit",
        auth: "Authorization: Bearer <api_key from register_agent>",
        checkout: sku.checkout,
        offerId: sku.offerId,
        price: sku.deskCents,
        note: "Claimed agent spends owner seat or matching credit. Stripe is the human rail.",
      },
    },
  ];
  if (payTo) {
    accepts.push({
      scheme: "exact",
      network: "base",
      maxAmountRequired: sku.usdcAtomic,
      resource,
      description: sku.description,
      mimeType: "application/json",
      payTo,
      maxTimeoutSeconds: 120,
      asset: BASE_USDC,
      extra: {
        name: "USD Coin",
        version: "2",
        rail: "base-usdc",
        caip2: BASE_CAIP2,
        facilitator: env.facilitator ?? null,
      },
    });
  }
  return {
    status: 402,
    body: {
      x402Version: 1,
      error: "Send Authorization: Bearer <api_key>, or a PAYMENT-SIGNATURE.",
      accepts,
    },
  };
}

export type PaymentDecision =
  | { ok: true; rail: "desk-credit" | "base-usdc"; sku: RackSku }
  | { ok: false; reason: string; challenge: ReturnType<typeof paymentRequired> };

/**
 * Fail-closed gate. A Base signature is accepted only after an external
 * facilitator verify+settle returns a tx hash. This function never invents one.
 */
export function decidePayment(opts: {
  sku: RackSku;
  env: X402Env;
  bearer?: string | null;
  claimed?: boolean;
  paymentSignature?: string | null;
  facilitatorSettlement?: { valid: boolean; txHash?: string } | null;
}): PaymentDecision {
  const challenge = paymentRequired(opts.sku, opts.env);
  if (opts.bearer && opts.claimed) {
    return { ok: true, rail: "desk-credit", sku: opts.sku };
  }
  const payTo = payToLive(opts.env.payTo);
  if (!payTo) {
    return { ok: false, reason: "usdc_rail_dark", challenge };
  }
  if (!opts.paymentSignature) {
    return { ok: false, reason: "missing_payment_signature", challenge };
  }
  if (!opts.facilitatorSettlement?.valid || !opts.facilitatorSettlement.txHash) {
    return { ok: false, reason: "facilitator_unsettled", challenge };
  }
  return { ok: true, rail: "base-usdc", sku: opts.sku };
}
