import { getVisibleProducts, searchFaqs, getFaqTopScore, services, shops } from "@/lib/data";
import { getOrderByNumber } from "@/lib/checkout/order-store";
import { getBookingByNumber } from "@/lib/booking/booking-store";
import { ORDER_STATUS_LABEL } from "@/lib/checkout/order-status";
import { BOOKING_STATUS_LABEL } from "@/lib/booking/booking-status";
import { tokenizeQuery, scoreMatch } from "@/lib/search/tokenize";
import type { ChatToolDefinition } from "./openai-types";
import type { ChatProductCard, ChatServiceCard } from "./types";

export const CHAT_TOOLS: ChatToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "search_products",
      description:
        "Search Nexora's product catalog to recommend or suggest products. Use this whenever the customer asks about, or would benefit from seeing, specific products.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search keywords — product name, brand, or category" },
          limit: { type: "number", description: "Max products to return (default 4, max 8)" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_services",
      description:
        "Search Nexora's bookable local services (home cleaning, repairs, beauty, photography, tech training, tutoring, security, etc.). Use this whenever the customer wants to hire, book, or asks about a professional or service, as opposed to a physical product.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search keywords — service type, category, or provider name" },
          limit: { type: "number", description: "Max services to return (default 4, max 8)" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_shop_info",
      description:
        "Look up details about a specific vendor's shop on Nexora — location, rating, verified status, delivery/return policies, and contact info. Use this when the customer asks about a particular shop or seller by name.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "The shop or vendor name the customer mentioned" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "track_order",
      description:
        "Look up the live status of a customer's order or service booking by its reference number. Order numbers look like MKT-20260713-ABCDE; booking numbers look like BKG-20260713-ABCDE.",
      parameters: {
        type: "object",
        properties: {
          reference: { type: "string", description: "The order or booking number the customer gave you" },
        },
        required: ["reference"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_faqs",
      description:
        "Search Nexora's FAQ knowledge base for shipping, payments, returns, vendor, and account policy questions.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "What the customer wants to know" },
        },
        required: ["query"],
      },
    },
  },
];

export interface ToolCallResult {
  content: string;
  products?: ChatProductCard[];
  services?: ChatServiceCard[];
  // The winning match's keyword score — only populated by the search_*
  // tools. Lets the offline fallback responder (fallback.ts) pick whichever
  // domain (products/services/FAQs) has the strongest match instead of
  // trying them in a fixed order, where a weak incidental hit in one domain
  // could otherwise beat a strong, directly relevant hit in another.
  topScore?: number;
}

// Tokenized keyword matching rather than whole-string substring containment
// — this is also called with full natural-language sentences (from the
// offline fallback responder), where "recommend a phone under GHS 2000"
// would never be a substring of any product name.
export function searchProductsTool(query: string, limit = 4): ToolCallResult {
  const cappedLimit = Math.min(Math.max(limit, 1), 8);
  const terms = tokenizeQuery(query);

  const scored = getVisibleProducts().map((product) => {
    const haystack = `${product.name} ${product.brand} ${product.categorySlug} ${product.description}`.toLowerCase();
    return { product, score: scoreMatch(terms, haystack) };
  });

  const ranked = scored.filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score);
  const topScore = ranked[0]?.score ?? 0;
  const matches = ranked.slice(0, cappedLimit).map((entry) => entry.product);

  const products: ChatProductCard[] = matches.map((product) => ({
    slug: product.slug,
    name: product.name,
    price: product.price,
    currency: product.currency,
    seed: product.seed,
    image: product.image,
    shopName: product.shopName,
    categorySlug: product.categorySlug,
  }));

  return {
    content:
      matches.length > 0
        ? `Found ${matches.length} product(s): ${matches
            .map((p) => `${p.name} — GHS ${p.price} from ${p.shopName}`)
            .join("; ")}`
        : `No products matched "${query}".`,
    products,
    topScore,
  };
}

export function searchServicesTool(query: string, limit = 4): ToolCallResult {
  const cappedLimit = Math.min(Math.max(limit, 1), 8);
  const terms = tokenizeQuery(query);

  const scored = services.map((service) => {
    const haystack = `${service.name} ${service.category} ${service.providerName} ${service.description}`.toLowerCase();
    return { service, score: scoreMatch(terms, haystack) };
  });

  const ranked = scored.filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score);
  const topScore = ranked[0]?.score ?? 0;
  const matches = ranked.slice(0, cappedLimit).map((entry) => entry.service);

  const results: ChatServiceCard[] = matches.map((service) => ({
    slug: service.slug,
    name: service.name,
    price: service.price,
    currency: service.currency,
    seed: service.seed,
    image: service.image,
    providerName: service.providerName,
    durationLabel: service.durationLabel,
    rating: service.rating,
  }));

  return {
    content:
      matches.length > 0
        ? `Found ${matches.length} service(s): ${matches
            .map((s) => `${s.name} — GHS ${s.price} by ${s.providerName} (${s.durationLabel})`)
            .join("; ")}`
        : `No bookable services matched "${query}".`,
    services: results,
    topScore,
  };
}

export function getShopInfoTool(name: string): ToolCallResult {
  const needle = name.trim().toLowerCase();
  if (!needle) return { content: "No shop name given." };

  const shop =
    shops.find((s) => s.name.toLowerCase() === needle) ??
    shops.find((s) => s.name.toLowerCase().includes(needle) || needle.includes(s.name.toLowerCase()));

  if (!shop) return { content: `No shop found matching "${name}". Try the exact shop name shown on a product listing.` };

  return {
    content: `${shop.name}${shop.verified ? " (verified)" : ""} — "${shop.tagline}". Rated ${shop.rating}/5 with ${shop.productCount} products and ${shop.followers} followers. Located at ${shop.location.addressLine}, ${shop.location.city}, ${shop.location.region}. Owner: ${shop.seller.ownerName}, responds ${shop.seller.responseTime.toLowerCase()} (${shop.seller.responseRate}% response rate). Policies: ${shop.policies.map((p) => `${p.title} — ${p.description}`).join(" | ")}`,
  };
}

export function trackOrderTool(reference: string): ToolCallResult {
  const normalized = reference.trim().toUpperCase();

  if (normalized.startsWith("BKG-")) {
    const booking = getBookingByNumber(normalized);
    if (!booking) return { content: `No booking found with reference ${normalized}.` };
    return {
      content: `Booking ${booking.bookingNumber} for "${booking.serviceName}" with ${booking.providerName} is currently ${BOOKING_STATUS_LABEL[booking.status]}. Scheduled for ${booking.scheduledDate} at ${booking.scheduledTimeLabel}. Total: GHS ${booking.price}.`,
    };
  }

  const order = getOrderByNumber(normalized);
  if (!order) return { content: `No order found with reference ${normalized}. Double-check the reference — order numbers look like MKT-20260713-ABCDE.` };
  return {
    content: `Order ${order.orderNumber} is currently ${ORDER_STATUS_LABEL[order.status]}. Placed on ${new Date(order.placedAt).toLocaleDateString()}, total GHS ${order.total}, payment status ${order.paymentStatus}.`,
  };
}

export function searchFaqsTool(query: string): ToolCallResult {
  const results = searchFaqs(query).slice(0, 3);
  return {
    content:
      results.length > 0
        ? results.map((faq) => `Q: ${faq.question}\nA: ${faq.answer}`).join("\n\n")
        : `No FAQ matched "${query}".`,
    topScore: getFaqTopScore(query),
  };
}

export function resolveToolCall(name: string, rawArguments: string): ToolCallResult {
  let args: Record<string, unknown> = {};
  try {
    args = JSON.parse(rawArguments);
  } catch {
    // fall through with empty args
  }

  switch (name) {
    case "search_products":
      return searchProductsTool(String(args.query ?? ""), typeof args.limit === "number" ? args.limit : 4);
    case "search_services":
      return searchServicesTool(String(args.query ?? ""), typeof args.limit === "number" ? args.limit : 4);
    case "get_shop_info":
      return getShopInfoTool(String(args.name ?? ""));
    case "track_order":
      return trackOrderTool(String(args.reference ?? ""));
    case "search_faqs":
      return searchFaqsTool(String(args.query ?? ""));
    default:
      return { content: `Unknown tool: ${name}` };
  }
}
