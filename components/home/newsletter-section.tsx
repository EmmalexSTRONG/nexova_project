"use client";

import { useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NewsletterSection() {
  const [status, setStatus] = useState<"idle" | "submitted">("idle");
  const [email, setEmail] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;
    setStatus("submitted");
  }

  return (
    <section className="bg-primary py-12 md:py-16">
      <div className="container flex flex-col items-center gap-5 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/15">
          <Mail className="h-5 w-5 text-primary-foreground" />
        </span>
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-primary-foreground sm:text-3xl">
            Get the best deals first
          </h2>
          <p className="mt-2 max-w-md text-sm text-primary-foreground/80">
            Flash sale alerts, new vendor spotlights, and market updates — straight to your inbox, no
            spam.
          </p>
        </div>

        {status === "submitted" ? (
          <p className="rounded-md bg-primary-foreground/15 px-4 py-2.5 text-sm font-medium text-primary-foreground">
            You&apos;re subscribed. Watch your inbox for the next flash sale.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-2 sm:flex-row">
            <Input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-transparent bg-card text-foreground placeholder:text-muted-foreground"
            />
            <Button type="submit" variant="secondary" className="shrink-0">
              Subscribe
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
