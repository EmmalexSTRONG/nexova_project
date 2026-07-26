export const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Central",
  "Eastern",
  "Volta",
  "Northern",
  "Bono",
  "Upper East",
  "Upper West",
] as const;

export type GhanaRegion = (typeof GHANA_REGIONS)[number];

export interface ShippingEstimate {
  cost: number;
  etaLabel: string;
}

const REGION_RATES: Record<GhanaRegion, ShippingEstimate> = {
  "Greater Accra": { cost: 15, etaLabel: "1–2 business days" },
  Ashanti: { cost: 20, etaLabel: "2–3 business days" },
  Western: { cost: 25, etaLabel: "3–4 business days" },
  Central: { cost: 22, etaLabel: "2–4 business days" },
  Eastern: { cost: 20, etaLabel: "2–3 business days" },
  Volta: { cost: 25, etaLabel: "3–4 business days" },
  Northern: { cost: 35, etaLabel: "4–6 business days" },
  Bono: { cost: 30, etaLabel: "3–5 business days" },
  "Upper East": { cost: 40, etaLabel: "5–7 business days" },
  "Upper West": { cost: 40, etaLabel: "5–7 business days" },
};

export function estimateShipping(region: GhanaRegion): ShippingEstimate {
  return REGION_RATES[region];
}
