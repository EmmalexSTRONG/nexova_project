export type ChatRole = "user" | "assistant";

export interface ChatProductCard {
  slug: string;
  name: string;
  price: number;
  currency: string;
  seed: number;
  image?: string;
  shopName: string;
  categorySlug: string;
}

export interface ChatServiceCard {
  slug: string;
  name: string;
  price: number;
  currency: string;
  seed: number;
  image?: string;
  providerName: string;
  durationLabel: string;
  rating: number;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  // Rich product/service recommendations attached to an assistant reply,
  // rendered as cards instead of (or alongside) plain text.
  products?: ChatProductCard[];
  services?: ChatServiceCard[];
  // Set when this message couldn't reach OpenAI and was answered by the
  // local rule-based fallback instead — surfaced in the UI so the
  // degraded mode is honest rather than pretending to be the real model.
  isFallback?: boolean;
}
