"use client";

import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { getAds, createAd, setAdActive, deleteAd, type Advertisement } from "@/lib/admin/ad-store";
import { getAllAdCampaigns, updateAdCampaignStatus } from "@/lib/advertising/ad-campaign-store";
import { AD_STATUS_LABEL, effectiveAdStatus } from "@/lib/advertising/ad-status";
import { AD_DURATION_LABEL, AD_PLACEMENT_LABEL } from "@/lib/advertising/pricing";
import type { AdCampaignStatus, PlacedAdCampaign } from "@/lib/advertising/types";
import { Price } from "@/components/shared/price";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminEmptyState } from "./admin-empty-state";
import { AdminLoadingState } from "./admin-loading-state";

const CAMPAIGN_STATUS_BADGE_VARIANT: Record<AdCampaignStatus, "success" | "secondary" | "outline" | "destructive"> = {
  ACTIVE: "success",
  PENDING_PAYMENT: "secondary",
  EXPIRED: "outline",
  CANCELLED: "destructive",
};

const PLACEMENT_LABEL: Record<Advertisement["placement"], string> = {
  HOMEPAGE_HERO: "Homepage hero",
  HOMEPAGE_BANNER: "Homepage banner",
  CATEGORY_PAGE: "Category page",
};

export function AdminAdvertisementsContent() {
  const [ads, setAds] = useState<Advertisement[] | undefined>(undefined);
  const [campaigns, setCampaigns] = useState<PlacedAdCampaign[] | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [placement, setPlacement] = useState<Advertisement["placement"]>("HOMEPAGE_BANNER");
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    setAds(getAds());
    setCampaigns(getAllAdCampaigns());
  }

  useEffect(refresh, []);

  function handleCancelCampaign(id: string) {
    updateAdCampaignStatus(id, "CANCELLED");
    refresh();
  }

  function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!title.trim() || !description.trim() || !linkUrl.trim()) {
      setError("Fill in every field before creating an ad.");
      return;
    }
    createAd({ title: title.trim(), description: description.trim(), linkUrl: linkUrl.trim(), placement });
    setTitle("");
    setDescription("");
    setLinkUrl("");
    refresh();
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Advertisements</h1>
        <p className="text-sm text-muted-foreground">Promotional banners shown across the storefront.</p>
      </div>

      <form onSubmit={handleCreate} className="rounded-lg border bg-card p-5">
        <h2 className="mb-4 font-display text-sm font-semibold">Create an ad</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Flash Sale — 30% Off Electronics" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkUrl">Link URL</Label>
            <Input id="linkUrl" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="/products?category=phones-electronics" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="This weekend only, on all phones and laptops." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="placement">Placement</Label>
            <select
              id="placement"
              value={placement}
              onChange={(e) => setPlacement(e.target.value as Advertisement["placement"])}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              {Object.entries(PLACEMENT_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <Button type="submit" className="mt-4">
          Create ad
        </Button>
      </form>

      {ads === undefined ? (
        <AdminLoadingState label="Loading ads..." />
      ) : ads.length === 0 ? (
        <AdminEmptyState icon={Megaphone} title="No ads yet" description="Create one above to promote it across the storefront." />
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Placement</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {ads.map((ad) => (
                <tr key={ad.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">{ad.title}</p>
                    <p className="text-xs text-muted-foreground">{ad.description}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{PLACEMENT_LABEL[ad.placement]}</td>
                  <td className="px-4 py-3">
                    <Badge variant={ad.active ? "success" : "secondary"}>{ad.active ? "Active" : "Inactive"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAdActive(ad.id, !ad.active);
                          refresh();
                        }}
                      >
                        {ad.active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          deleteAd(ad.id);
                          refresh();
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div>
        <h2 className="font-display text-lg font-semibold">Vendor ad campaigns</h2>
        <p className="text-sm text-muted-foreground">Paid placements purchased by vendors through Advertising.</p>
      </div>

      {campaigns === undefined ? (
        <AdminLoadingState label="Loading campaigns..." />
      ) : campaigns.length === 0 ? (
        <AdminEmptyState
          icon={Megaphone}
          title="No vendor campaigns yet"
          description="Purchases made from a vendor's Advertising page will show up here."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Campaign</th>
                <th className="px-4 py-3 font-medium">Shop</th>
                <th className="px-4 py-3 font-medium">Placement</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {campaigns.map((campaign) => {
                const status = effectiveAdStatus(campaign);
                const canCancel = status === "ACTIVE" || status === "PENDING_PAYMENT";
                return (
                  <tr key={campaign.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-medium">{campaign.id}</p>
                      <p className="text-xs text-muted-foreground">{campaign.title}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{campaign.shopName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{AD_PLACEMENT_LABEL[campaign.placement]}</td>
                    <td className="px-4 py-3 text-muted-foreground">{AD_DURATION_LABEL[campaign.duration]}</td>
                    <td className="px-4 py-3">
                      <Price amount={campaign.amount} currency={campaign.currency} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={CAMPAIGN_STATUS_BADGE_VARIANT[status]}>{AD_STATUS_LABEL[status]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {canCancel && (
                        <Button size="sm" variant="outline" onClick={() => handleCancelCampaign(campaign.id)}>
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
