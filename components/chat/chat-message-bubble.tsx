import { WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/chat/types";
import { ChatProductCard } from "./chat-product-card";
import { ChatServiceCard } from "./chat-service-card";
import { ChatLogo } from "./chat-logo";

export function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-2", isUser && "flex-row-reverse")}>
      {!isUser && <ChatLogo size={28} className="shrink-0" />}
      <div className={cn("flex max-w-[80%] flex-col gap-2", isUser && "items-end")}>
        <div
          className={cn(
            "whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
            isUser ? "rounded-tr-sm bg-primary text-primary-foreground" : "rounded-tl-sm bg-muted",
          )}
        >
          {message.content}
        </div>
        {message.isFallback && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <WifiOff className="h-3 w-3" />
            Offline mode — limited answers
          </span>
        )}
        {message.products && message.products.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {message.products.map((product) => (
              <ChatProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
        {message.services && message.services.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {message.services.map((service) => (
              <ChatServiceCard key={service.slug} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
