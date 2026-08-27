/**
 * Canonical first-dollar SKUs.
 * Stripe Payment Links are live and must not be invented.
 * x402 prices match those SKUs in USDC (exact).
 *
 * A successful x402 call returns a receipt. It does not by itself
 * mutate desk entitlements — host owns fulfillment (fail-closed).
 */

export const RECEIVE = {
  evm: "0xD3d0E9eDAe3Ac7bb199a8EAA761BdA423b878438",
  solana: "ETQwWf19axArsY493UfC6bxe2BmEzmzvCb58PPnC38A",
} as const;

export const NETWORKS = {
  base: "eip155:8453",
  solana: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
} as const;

/** Base native USDC. Use this in grant forms / explorer links. */
export const BASE_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
export const PRIMARY_NETWORK = NETWORKS.base;

export type Sku = {
  id: string;
  path: string;
  price: string;
  unit: string;
  description: string;
  stripe: string;
  github: string;
};

export const SKUS: Sku[] = [
  {
    id: "os-cycle",
    path: "/v1/cycle",
    price: "$0.75",
    unit: "agent_cycle",
    description: "Agentic OS Cycle — one evidence-gated kernel cycle credit",
    stripe: "https://buy.stripe.com/3cI14o8R8dXD3p3frO43S04",
    github: "https://github.com/ANAMIZED/LRSI",
  },
  {
    id: "opengos-search",
    path: "/v1/search",
    price: "$0.40",
    unit: "search",
    description: "OpenGOS Advanced Search — one ranked grant-search credit",
    stripe: "https://buy.stripe.com/7sY8wQ5EW3iZ5xb5Re43S06",
    github: "https://github.com/ANAMIZED/OpenGOS",
  },
  {
    id: "opengos-draft",
    path: "/v1/draft",
    price: "$2.50",
    unit: "proposal_draft",
    description: "OpenGOS Proposal Draft — one draft-credit",
    stripe: "https://buy.stripe.com/9B69AUd7o7zf2kZ2F243S03",
    github: "https://github.com/ANAMIZED/OpenGOS",
  },
  {
    id: "trading-cycle",
    path: "/v1/trading",
    price: "$4.00",
    unit: "trading_cycle",
    description:
      "Agentic Trading Decision Cycle — one Scan→Quant→Risk Gates credit (receipt-only; not live execution)",
    stripe: "https://buy.stripe.com/bJedRaebsaLr2kZ2F243S05",
    github: "https://github.com/ANAMIZED/AgenticArb",
  },
];

export function skuByPath(path: string): Sku | undefined {
  return SKUS.find((s) => s.path === path);
}
