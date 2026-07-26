import { createListStore } from "@/lib/shared/local-storage-store";
import type { ChatMessage } from "./types";

const store = createListStore<ChatMessage>("nexora:chat-history:v1");

export function getChatHistory(): ChatMessage[] {
  return store.readAll();
}

export function appendChatMessage(message: ChatMessage): void {
  const messages = store.readAll();
  messages.push(message);
  store.writeAll(messages);
}

export function clearChatHistory(): void {
  store.writeAll([]);
}
