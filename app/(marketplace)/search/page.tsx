import type { Metadata } from "next";
import { Search } from "lucide-react";
import { getVisibleProducts } from "@/lib/data";
import { ProductCard } from "@/components/marketplace/product-card";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `"${q}" — Search results — Nexora` : "Search — Nexora" };
}

function matchesQuery(haystack: string, terms: string[]): boolean {
  const normalized = haystack.toLowerCase();
  return terms.every((term) => normalized.includes(term));
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  const results =
    terms.length === 0
      ? []
      : getVisibleProducts().filter((product) =>
          matchesQuery([product.name, product.brand, product.shopName, product.description].join(" "), terms),
        );

  return (
    <div className="container py-8">
      <h1 className="font-display text-2xl font-bold tracking-tight">
        {query ? (
          <>
            Search results for <span className="text-primary">&ldquo;{query}&rdquo;</span>
          </>
        ) : (
          "Search"
        )}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {query ? `${results.length} product${results.length === 1 ? "" : "s"} found` : "Search for products, shops, and services above."}
      </p>

      {query && results.length === 0 && (
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
            <Search className="h-5 w-5" />
          </span>
          <p className="text-sm font-medium">No products matched &ldquo;{query}&rdquo;</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Try a different word, or check the spelling — you can also browse by category instead.
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
