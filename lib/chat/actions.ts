"use server";

import { expressInternalFetch } from "@/lib/api/express";
import type { ChatMessageInput, ChatToolDefinition, ChatCompletionResult } from "./openai-types";

export async function chatCompletionAction(
  messages: ChatMessageInput[],
  tools: ChatToolDefinition[],
): Promise<ChatCompletionResult | null> {
  // Best-effort, same resilience contract as every other external-API
  // action in this app — a failed call degrades to the local fallback
  // responder rather than breaking the chat UI.
  try {
    const result = await expressInternalFetch<ChatCompletionResult>("/chat/completions", {
      method: "POST",
      body: JSON.stringify({ messages, tools }),
    });
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
