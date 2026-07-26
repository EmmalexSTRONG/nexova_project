import { env } from "../utils/env";

const OPENAI_BASE_URL = "https://api.openai.com/v1";

export interface ChatToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

export interface ChatMessageInput {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: ChatToolCall[];
  tool_call_id?: string;
  name?: string;
}

export interface ChatToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface ChatCompletionResult {
  role: "assistant";
  content: string | null;
  toolCalls: ChatToolCall[];
}

interface OpenAiChatCompletionResponse {
  choices: {
    message: {
      role: "assistant";
      content: string | null;
      tool_calls?: ChatToolCall[];
    };
  }[];
  error?: { message: string };
}

export async function createChatCompletion(
  messages: ChatMessageInput[],
  tools?: ChatToolDefinition[],
): Promise<ChatCompletionResult> {
  const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL,
      messages,
      ...(tools && tools.length > 0 ? { tools, tool_choice: "auto" } : {}),
      temperature: 0.4,
    }),
  });

  const body = (await res.json()) as OpenAiChatCompletionResponse;

  if (!res.ok) {
    throw new Error(body.error?.message || `OpenAI request failed with status ${res.status}`);
  }

  const message = body.choices[0]?.message;
  if (!message) {
    throw new Error("OpenAI returned no completion choices");
  }

  return { role: "assistant", content: message.content, toolCalls: message.tool_calls ?? [] };
}
