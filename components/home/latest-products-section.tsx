"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { MockProduct } from "@/lib/data";
import { getLatestProductsLive } from "@/lib/marketplace/latest-products";
import { VENDOR_PRODUCT_DRAFTS_STORAGE_KEY } from "@/lib/vendor/product-draft-store";
import { useLiveRefresh } from "@/lib/shared/use-live-refresh";
import { ProductCard } from "@/components/marketplace/product-card";
import { SectionHeader } from "@/components/shared/section-header";

export function LatestProductsSection() {
  const [latest, setLatest] = useState<MockProduct[]>(() => getLatestProductsLive(undefined, true));

  useLiveRefresh(() => setLatest(getLatestProductsLive()), [VENDOR_PRODUCT_DRAFTS_STORAGE_KEY]);

  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <SectionHeader eyebrow="Just in" title="Latest products" description="Freshly listed by our vendors." href="/categories" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {latest.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: (index % 5) * 0.07, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {product.isNew && (
                <span className="absolute -inset-1.5 -z-10 rounded-xl bg-primary/10 blur-md" aria-hidden="true" />
              )}
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
