"use client";

import dynamic from "next/dynamic";

// Code-splits the chat widget (and its useChat/useVoice dependency chain,
// including the speech recognition/synthesis surface) out of the shared
// root-layout bundle — it's mounted on every page today, so every visitor
// paid to download it even on routes where they never open it.
export const ChatWidget = dynamic(() => import("./chat-widget").then((mod) => mod.ChatWidget), { ssr: false });
