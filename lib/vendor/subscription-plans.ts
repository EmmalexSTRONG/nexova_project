export interface VendorSubscriptionPlan {
  id: string;
  name: string;
  priceGhs: number;
  tagline: string;
  features: string[];
  highlighted?: boolean;
}

export const VENDOR_SUBSCRIPTION_PLANS: VendorSubscriptionPlan[] = [
  {
    id: "starter",
    name: "Starter",
    priceGhs: 50,
    tagline: "For a new shop testing the waters.",
    features: ["Up to 20 active listings", "Standard shop page", "Email support"],
  },
  {
    id: "growth",
    name: "Growth",
    priceGhs: 150,
    tagline: "For shops ready to scale up.",
    features: [
      "Up to 200 active listings",
      "Featured placement in category pages",
      "Priority email + WhatsApp support",
      "Eligible for Flash Sales campaigns",
    ],
    highlighted: true,
  },
  {
    id: "pro",
    name: "Pro",
    priceGhs: 350,
    tagline: "For established, high-volume shops.",
    features: [
      "Unlimited active listings",
      "Homepage & search placement eligibility",
      "Dedicated account support",
      "Lowest transaction fees",
    ],
  },
];

export function getVendorSubscriptionPlan(id: string): VendorSubscriptionPlan | undefined {
  return VENDOR_SUBSCRIPTION_PLANS.find((plan) => plan.id === id);
}
