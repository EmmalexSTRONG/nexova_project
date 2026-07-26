"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, Send, Trash2, Volume2, VolumeX, X } from "lucide-react";
import { useChat } from "@/lib/chat/use-chat";
import { useVoice } from "@/lib/chat/use-voice";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChatMessageBubble } from "./chat-message-bubble";
import { ChatLogo } from "./chat-logo";

const SUGGESTED_PROMPTS = [
  "Recommend a good phone under GHS 2000",
  "Track my order MKT-20260713-ABCDE",
  "How do returns work?",
  "How do I book a service?",
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const { messages, isLoading, sendMessage, clearHistory } = useChat();
  const voice = useVoice();
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSpokenIdRef = useRef<string | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    function handleOpenRequest() {
      setIsOpen(true);
    }
    window.addEventListener("nexora:open-chat", handleOpenRequest);
    return () => window.removeEventListener("nexora:open-chat", handleOpenRequest);
  }, []);

  // Read new assistant replies aloud when voice output is on — guarded so
  // it only speaks freshly-arrived messages, never the history loaded from
  // storage on mount or messages already spoken.
  useEffect(() => {
    if (!voice.voiceEnabled) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant" || last.id === lastSpokenIdRef.current) return;
    lastSpokenIdRef.current = last.id;
    voice.speak(last.content);
  }, [messages, voice]);

  function handleSend(text?: string) {
    const value = (text ?? draft).trim();
    if (!value || isLoading) return;
    setDraft("");
    void sendMessage(value);
  }

  function handleMicClick() {
    if (voice.isListening) {
      voice.stopListening();
      return;
    }
    voice.startListening((transcript) => {
      setDraft(transcript);
      handleSend(transcript);
    });
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 print:hidden">
      {isOpen && (
        <div className="flex h-[32rem] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border bg-card shadow-2xl">
          <div className="flex items-center gap-2 bg-ink px-4 py-3 text-ink-foreground">
            <ChatLogo size={34} className="shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">Chat Mr President AI</p>
              <p className="truncate text-[11px] opacity-70">Ask about products, orders, or anything Nexora</p>
            </div>
            {voice.isSupported && (
              <button
                type="button"
                onClick={() => voice.setVoiceEnabled((enabled) => !enabled)}
                aria-label={voice.voiceEnabled ? "Turn off voice replies" : "Turn on voice replies"}
                aria-pressed={voice.voiceEnabled}
                className={cn("rounded-md p-1.5 hover:bg-white/10", voice.voiceEnabled && "text-primary")}
              >
                {voice.voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
            )}
            <button type="button" onClick={clearHistory} aria-label="Clear chat" className="rounded-md p-1.5 hover:bg-white/10">
              <Trash2 className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close chat" className="rounded-md p-1.5 hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <ChatLogo size={28} className="shrink-0" />
                  <div className="rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2 text-sm leading-relaxed">
                    Welcome to Nexora! I&apos;m Chat Mr President AI — I can recommend products, track your orders
                    and bookings, and answer questions. What can I help with?
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-9">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSend(prompt)}
                      className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <ChatMessageBubble key={message.id} message={message} />
            ))}

            {isLoading && (
              <div className="flex gap-2">
                <ChatLogo size={28} className="shrink-0" />
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t p-3"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={voice.isListening ? "Listening..." : "Ask Chat Mr President AI..."}
              className="h-9 flex-1 rounded-full border border-input bg-background px-3.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {voice.isSupported && (
              <Button
                type="button"
                size="icon"
                variant={voice.isListening ? "default" : "outline"}
                className="h-9 w-9 shrink-0 rounded-full"
                onClick={handleMicClick}
                aria-label={voice.isListening ? "Stop listening" : "Speak your message"}
                aria-pressed={voice.isListening}
              >
                <Mic className={cn("h-4 w-4", voice.isListening && "animate-pulse")} />
              </Button>
            )}
            <Button
              type="submit"
              size="icon"
              aria-label="Send message"
              className="h-9 w-9 shrink-0 rounded-full"
              disabled={!draft.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}

      <div className="flex items-center gap-1">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              type="button"
              onClick={() => setIsOpen(true)}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden rounded-full border border-primary/40 bg-ink px-3.5 py-2 text-xs font-medium text-ink-foreground shadow-lg sm:block"
            >
              <motion.span
                className="absolute inset-0 rounded-full border border-primary/40"
                animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.08, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="relative">
                Confused? <span className="text-primary">Ask me</span>
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? "Close chat" : "Open Chat Mr President AI"}
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105",
            isOpen && "bg-primary text-primary-foreground",
          )}
        >
          {isOpen ? <X className="h-6 w-6" /> : <ChatLogo size={64} />}
        </button>
      </div>
    </div>
  );
}
