"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, Trash2 } from "lucide-react";
import { products, type MockProduct } from "@/lib/data";
import {
  deleteFlashSaleCampaign,
  generateFlashSaleCampaignId,
  saveFlashSaleCampaign,
  updateFlashSaleCampaign,
  type DiscountType,
  type FlashSaleCampaign,
} from "@/lib/admin/flash-sale-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { OptionPicker } from "@/components/shared/option-picker";
import { confirmAndDelete } from "@/lib/shared/confirm-delete";

function toDatetimeLocalValue(iso: string | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

export function AdminFlashSaleForm({ campaign }: { campaign?: FlashSaleCampaign }) {
  const router = useRouter();
  const isEdit = Boolean(campaign);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [discountType, setDiscountType] = useState<DiscountType>(campaign?.discountType ?? "PERCENTAGE");
  const [startsAtInput, setStartsAtInput] = useState(toDatetimeLocalValue(campaign?.startsAt ?? new Date().toISOString()));
  const [endsAtInput, setEndsAtInput] = useState(
    toDatetimeLocalValue(campaign?.endsAt ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()),
  );
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set(campaign?.productSlugs ?? []));
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return products;
    return products.filter(
      (product) => product.name.toLowerCase().includes(needle) || product.shopName.toLowerCase().includes(needle),
    );
  }, [search]);

  function toggleProduct(slug: string) {
    setSelectedSlugs((current) => {
      const next = new Set(current);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "").trim();
    const discountValue = Number(formData.get("discountValue"));

    if (!title) {
      setError("Give the campaign a name.");
      return;
    }
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      setError("Enter a discount value greater than zero.");
      return;
    }
    if (discountType === "PERCENTAGE" && discountValue >= 100) {
      setError("A percentage discount must be less than 100.");
      return;
    }
    if (!startsAtInput || !endsAtInput) {
      setError("Choose a start and end date.");
      return;
    }
    const startsAt = new Date(startsAtInput).toISOString();
    const endsAt = new Date(endsAtInput).toISOString();
    if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
      setError("The end time must be after the start time.");
      return;
    }
    if (selectedSlugs.size === 0) {
      setError("Select at least one product for this campaign.");
      return;
    }

    setSubmitting(true);
    const now = new Date().toISOString();

    if (isEdit && campaign) {
      updateFlashSaleCampaign(campaign.id, {
        title,
        discountType,
        discountValue,
        productSlugs: Array.from(selectedSlugs),
        startsAt,
        endsAt,
      });
    } else {
      saveFlashSaleCampaign({
        id: generateFlashSaleCampaignId(),
        title,
        discountType,
        discountValue,
        productSlugs: Array.from(selectedSlugs),
        startsAt,
        endsAt,
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
      });
    }

    router.push("/admin/flash-sales");
    router.refresh();
  }

  function handleDelete() {
    if (!campaign) return;
    confirmAndDelete(`Delete "${campaign.title}"? This can't be undone.`, () => {
      deleteFlashSaleCampaign(campaign.id);
      router.push("/admin/flash-sales");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-card p-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="title">Campaign name</Label>
        <Input id="title" name="title" placeholder="e.g. Weekend Flash Sale" defaultValue={campaign?.title} required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Discount type</Label>
          <OptionPicker
            label="Discount type"
            columns={2}
            value={discountType}
            onChange={setDiscountType}
            options={[
              { value: "PERCENTAGE", label: "Percentage off" },
              { value: "FIXED", label: "Fixed amount off" },
            ]}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="discountValue">{discountType === "PERCENTAGE" ? "Discount (%)" : "Discount (GHS)"}</Label>
          <Input
            id="discountValue"
            name="discountValue"
            type="number"
            min="0"
            step={discountType === "PERCENTAGE" ? "1" : "0.01"}
            defaultValue={campaign?.discountValue}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="startsAt">Starts</Label>
          <Input
            id="startsAt"
            type="datetime-local"
            value={startsAtInput}
            onChange={(e) => setStartsAtInput(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="endsAt">Ends</Label>
          <Input id="endsAt" type="datetime-local" value={endsAtInput} onChange={(e) => setEndsAtInput(e.target.value)} required />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>Products ({selectedSlugs.size} selected)</Label>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products or shops..." className="pl-8" />
        </div>
        <div className="mt-1.5 max-h-72 overflow-y-auto rounded-lg border">
          {filteredProducts.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">No products match.</p>
          ) : (
            <ul className="divide-y">
              {filteredProducts.map((product: MockProduct) => (
                <li key={product.slug}>
                  <label className="flex cursor-pointer flex-col gap-1 px-3 py-2 text-sm hover:bg-muted/40 sm:flex-row sm:items-center sm:gap-3">
                    <span className="flex items-center gap-3 sm:contents">
                      <Checkbox
                        checked={selectedSlugs.has(product.slug)}
                        onCheckedChange={() => toggleProduct(product.slug)}
                      />
                      <span className="flex-1 truncate sm:flex-1">{product.name}</span>
                    </span>
                    <span className="flex items-center justify-between gap-3 pl-7 sm:contents sm:pl-0">
                      <span className="shrink-0 text-xs text-muted-foreground">{product.shopName}</span>
                      <span className="shrink-0 font-mono text-xs">
                        {product.currency} {product.price.toLocaleString()}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        {isEdit ? (
          <Button type="button" variant="ghost" onClick={handleDelete} className="gap-1.5 text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
            Delete campaign
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/flash-sales")}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : isEdit ? "Save changes" : "Create campaign"}
          </Button>
        </div>
      </div>
    </form>
  );
}
