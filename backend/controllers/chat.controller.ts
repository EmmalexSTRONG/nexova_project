import type { Request, Response } from "express";
import { z } from "zod";
import { createChatCompletion } from "../utils/openai";

const chatToolCallSchema = z.object({
  id: z.string(),
  type: z.literal("function"),
  function: z.object({ name: z.string(), arguments: z.string() }),
});

const chatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant", "tool"]),
  content: z.string().nullable(),
  tool_calls: z.array(chatToolCallSchema).optional(),
  tool_call_id: z.string().optional(),
  name: z.string().optional(),
});

const chatToolSchema = z.object({
  type: z.literal("function"),
  function: z.object({
    name: z.string(),
    description: z.string(),
    parameters: z.record(z.unknown()),
  }),
});

export const chatCompletionSchema = z.object({
  messages: z.array(chatMessageSchema).min(1),
  tools: z.array(chatToolSchema).optional(),
});

export async function chatCompletion(req: Request, res: Response) {
  const { messages, tools } = req.body;
  const result = await createChatCompletion(messages, tools);
  res.status(200).json({ success: true, data: result });
}
