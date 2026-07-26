import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { ContactForm } from "@/components/support/contact-form";

export const metadata: Metadata = {
  title: "Contact us — Nexora",
  description: "Get in touch with the Nexora support team.",
};

const CONTACT_DETAILS = [
  { icon: Mail, label: "support@nexora.gh" },
  { icon: Phone, label: "+233 30 123 4567" },
  { icon: MapPin, label: "Accra, Ghana" },
];

export default function ContactPage() {
  return (
    <div className="container max-w-3xl py-8">
      <h1 className="font-display text-2xl font-bold tracking-tight">Contact us</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Questions about an order, a vendor account, or anything else — send us a message and we&apos;ll get back to
        you.
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_260px]">
        <ContactForm />

        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-5">
            <h2 className="font-display text-sm font-semibold">Reach us directly</h2>
            <ul className="mt-3 space-y-2.5">
              {CONTACT_DETAILS.map((detail) => (
                <li key={detail.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <detail.icon className="h-4 w-4 shrink-0 text-primary" />
                  {detail.label}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border bg-card p-5">
            <h2 className="font-display text-sm font-semibold">Looking for quick answers?</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Check the <Link href="/help" className="font-medium text-foreground hover:underline">help center</Link> for
              delivery, returns, and payment questions — most get answered instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
