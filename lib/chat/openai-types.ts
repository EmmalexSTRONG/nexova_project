// Mirrors the shape backend/utils/openai.ts sends/receives — kept as a
// separate copy here since frontend and backend don't share a types
// package for this feature.

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
