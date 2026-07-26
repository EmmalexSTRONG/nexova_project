"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { faqs, searchFaqs } from "@/lib/data";
import { Input } from "@/components/ui/input";

export function HelpFaqSearch() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const trimmed = query.trim();
    return trimmed ? searchFaqs(trimmed) : faqs;
  }, [query]);

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search for help — delivery, returns, payments..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-11 pl-9"
          aria-label="Search help articles"
        />
      </div>

      {results.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          No answers matched &ldquo;{query}&rdquo; — try a different word, or use the chat button in the corner
          for direct help.
        </p>
      ) : (
        <div className="mt-6 divide-y rounded-lg border bg-card">
          {results.map((faq) => (
            <details key={faq.id} className="group p-4">
              <summary className="cursor-pointer list-none text-sm font-medium marker:content-none">
                <span className="flex items-center justify-between gap-3">
                  {faq.question}
                  <span className="shrink-0 text-xs font-normal text-muted-foreground">{faq.category}</span>
                </span>
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
