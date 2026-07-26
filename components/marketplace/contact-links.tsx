import { Mail, MessageCircle, Phone } from "lucide-react";

function toWhatsAppLink(number: string) {
  return `https://wa.me/${number.replace(/[^0-9]/g, "")}`;
}

export function ContactLinks({
  phone,
  whatsapp,
  email,
  variant = "default",
}: {
  phone: string;
  whatsapp: string;
  email: string;
  variant?: "default" | "compact";
}) {
  const itemClass =
    variant === "compact"
      ? "flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
      : "flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:border-primary hover:text-primary";

  return (
    <div className={variant === "compact" ? "flex flex-wrap gap-4" : "flex flex-wrap gap-2"}>
      <a href={`tel:${phone}`} className={itemClass}>
        <Phone className="h-4 w-4" />
        {variant === "compact" ? phone : "Call"}
      </a>
      <a href={toWhatsAppLink(whatsapp)} target="_blank" rel="noopener noreferrer" className={itemClass}>
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </a>
      <a href={`mailto:${email}`} className={itemClass}>
        <Mail className="h-4 w-4" />
        {variant === "compact" ? email : "Email"}
      </a>
    </div>
  );
}
