import { searchProductsTool, searchServicesTool, trackOrderTool, searchFaqsTool, type ToolCallResult } from "./tools";

const REFERENCE_PATTERN = /\b(MKT|BKG)-\d{8}-[A-Z0-9]{5}\b/i;

// Used when the OpenAI call fails outright (no key configured, network
// unreachable, rate limited) — genuinely useful for the structured
// capabilities (order tracking, product/service search, FAQs) without an
// LLM, while being upfront that open-ended conversation is degraded.
export function getFallbackReply(userText: string): ToolCallResult {
  const referenceMatch = userText.match(REFERENCE_PATTERN);
  if (referenceMatch) {
    return trackOrderTool(referenceMatch[0]);
  }

  // Score every domain rather than trying them in a fixed order — a query
  // like "fix my AC" should win on search_services (an exact "AC" hit in a
  // service name) even though the phrase also weakly, incidentally matches
  // an unrelated FAQ that merely uses "AC repair" as an example in passing.
  // Products/services win ties since a bookable/buyable result is more
  // directly useful than a policy answer.
  const candidates = [
    searchServicesTool(userText, 4),
    searchProductsTool(userText, 4),
    searchFaqsTool(userText),
  ];

  const best = candidates.reduce((top, candidate) =>
    (candidate.topScore ?? 0) > (top.topScore ?? 0) ? candidate : top,
  );

  if ((best.topScore ?? 0) > 0) return best;

  return {
    content:
      "I'm having trouble reaching my AI brain right now, so I can only help with FAQs, product/service search, and order/booking tracking in this mode. Try asking about a specific product or service, or give me an order or booking number — or reach our support team directly.",
  };
}
