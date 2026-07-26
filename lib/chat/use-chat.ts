"use client";

import { useCallback, useEffect, useState } from "react";
import { categories } from "@/lib/data";
import { appendChatMessage, getChatHistory, clearChatHistory as clearHistoryStore } from "./chat-store";
import { chatCompletionAction } from "./actions";
import { resolveToolCall, CHAT_TOOLS } from "./tools";
import { getFallbackReply } from "./fallback";
import type { ChatMessage, ChatProductCard, ChatServiceCard } from "./types";
import type { ChatMessageInput } from "./openai-types";

// Built from live data rather than a hand-typed list, so the prompt can
// never drift out of sync with the actual category catalog.
const CATEGORY_NAMES = categories.map((category) => category.name).join(", ");

const SYSTEM_PROMPT = `You are Chat Mr President AI, the friendly and knowledgeable virtual assistant for Nexora, a multi-vendor marketplace built for Ghana. Nexora connects 3,000+ independent vendors across all 16 regions with a single, trusted checkout — vendors keep their own shop, pricing, and inventory; Nexora handles discovery, checkout, and delivery coordination. All prices are in Ghana cedis (GHS). Average delivery is 1–2 days in Greater Accra and up to a week elsewhere; Nexora does not currently ship outside Ghana.

The product catalog spans these categories: ${CATEGORY_NAMES}. Beyond physical products, Nexora also offers bookable local services (home cleaning, repairs, beauty, photography, tech training, tutoring, security installs, and more) — these are a separate, equally important part of the platform.

You help customers:
- find and recommend products from the catalog (use search_products)
- find and recommend bookable local services (use search_services) — don't confuse these with products; a request to "hire", "book", or "get someone to" do something is a service, not a product
- look up a specific vendor's shop — location, rating, policies, contact (use get_shop_info)
- track their orders and service bookings by reference number (use track_order — order numbers look like MKT-YYYYMMDD-XXXXX, booking numbers like BKG-YYYYMMDD-XXXXX)
- answer policy questions on shipping, payments, returns, becoming a vendor, or booking services (use search_faqs)
- point customers to the right page when they're not sure where to go (e.g. My Orders is under Account, selling is under "Sell on Nexora", coupons are applied in the cart or at checkout)

Always prefer calling a tool over guessing whenever the answer depends on specific data — product details, prices, stock, order/booking status, or shop info. Never invent an order status, price, or policy detail. Keep replies concise, warm, and conversational; a short line of text plus the tool's rich cards (shown automatically) is usually enough — you don't need to repeat every detail from the tool result in prose. If something is outside what you can help with (account security issues, payment disputes, complaints), say so plainly and point the customer to Contact us or their order's tracking page rather than guessing.`;

const MAX_TOOL_ROUNDS = 3;
const HISTORY_WINDOW = 12;

function toInput(message: ChatMessage): ChatMessageInput {
  return { role: message.role, content: message.content };
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMessages(getChatHistory());
  }, []);

  const sendMessage = useCallback(async (userText: string) => {
    const trimmed = userText.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    appendChatMessage(userMessage);
    setMessages((current) => [...current, userMessage]);
    setIsLoading(true);

    const history: ChatMessageInput[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...getChatHistory().slice(-HISTORY_WINDOW).map(toInput),
    ];

    let finalContent: string | null = null;
    // Accumulated (not overwritten) across every tool call in every round —
    // a single turn can reasonably call both search_products and
    // search_services, and both sets of results should reach the UI.
    let finalProducts: ChatProductCard[] = [];
    let finalServices: ChatServiceCard[] = [];
    let usedFallback = false;

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const result = await chatCompletionAction(history, CHAT_TOOLS);

      if (!result) {
        const fallback = getFallbackReply(trimmed);
        finalContent = fallback.content;
        finalProducts = fallback.products ?? [];
        finalServices = fallback.services ?? [];
        usedFallback = true;
        break;
      }

      if (result.toolCalls.length === 0) {
        finalContent = result.content ?? "Sorry, I didn't quite catch that — could you rephrase?";
        break;
      }

      // The model wants to call tools — resolve each one locally (against
      // localStorage orders/bookings or the mock product/service catalog,
      // none of which the Express proxy can see) and loop back with the
      // results so it can produce a final natural-language reply.
      history.push({ role: "assistant", content: result.content, tool_calls: result.toolCalls });

      for (const toolCall of result.toolCalls) {
        const toolResult = resolveToolCall(toolCall.function.name, toolCall.function.arguments);
        if (toolResult.products) finalProducts = [...finalProducts, ...toolResult.products];
        if (toolResult.services) finalServices = [...finalServices, ...toolResult.services];
        history.push({
          role: "tool",
          content: toolResult.content,
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
        });
      }

      if (round === MAX_TOOL_ROUNDS - 1) {
        finalContent = "I found some results but I'm having trouble summarizing them right now — please see below.";
      }
    }

    const assistantMessage: ChatMessage = {
      id: `msg-${Date.now()}-a`,
      role: "assistant",
      content: finalContent ?? "Sorry, something went wrong. Please try again.",
      timestamp: new Date().toISOString(),
      products: finalProducts.length > 0 ? finalProducts : undefined,
      services: finalServices.length > 0 ? finalServices : undefined,
      isFallback: usedFallback,
    };
    appendChatMessage(assistantMessage);
    setMessages((current) => [...current, assistantMessage]);
    setIsLoading(false);
  }, []);

  const clearHistory = useCallback(() => {
    clearHistoryStore();
    setMessages([]);
  }, []);

  return { messages, isLoading, sendMessage, clearHistory };
}
