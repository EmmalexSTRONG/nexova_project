"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2, Zap } from "lucide-react";
import {
  FLASH_SALE_CAMPAIGNS_STORAGE_KEY,
  cancelFlashSaleCampaign,
  deleteFlashSaleCampaign,
  getAllFlashSaleCampaigns,
  getFlashSaleCampaignPhase,
  type FlashSaleCampaign,
} from "@/lib/admin/flash-sale-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { confirmAndDelete } from "@/lib/shared/confirm-delete";

const PHASE_BADGE: Record<ReturnType<typeof getFlashSaleCampaignPhase>, { label: string; variant: "secondary" | "success" | "outline" | "destructive" }> = {
  upcoming: { label: "Upcoming", variant: "outline" },
  live: { label: "Live", variant: "success" },
  ended: { label: "Ended", variant: "secondary" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function AdminFlashSalesContent() {
  const [campaigns, setCampaigns] = useState<FlashSaleCampaign[]>([]);

  useEffect(() => {
    function load() {
      setCampaigns(getAllFlashSaleCampaigns());
    }
    load();
    function handleStorage(event: StorageEvent) {
      if (event.key === null || event.key === FLASH_SALE_CAMPAIGNS_STORAGE_KEY) load();
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  function handleCancel(id: string) {
    cancelFlashSaleCampaign(id);
    setCampaigns(getAllFlashSaleCampaigns());
  }

  function handleDelete(id: string, title: string) {
    confirmAndDelete(`Delete "${title}"? This can't be undone.`, () => {
      deleteFlashSaleCampaign(id);
      setCampaigns(getAllFlashSaleCampaigns());
    });
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Flash sales</h1>
          <p className="text-sm text-muted-foreground">
            {campaigns.length} {campaigns.length === 1 ? "campaign" : "campaigns"} ·{" "}
            {campaigns.filter((c) => getFlashSaleCampaignPhase(c) === "live").length} live now
          </p>
        </div>
        <Button asChild className="gap-1.5">
          <Link href="/admin/flash-sales/new">
            <Plus className="h-4 w-4" />
            New campaign
          </Link>
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <AdminEmptyState
          icon={Zap}
          title="No flash sale campaigns yet"
          description="Create one to discount selected products for a limited window."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Campaign</th>
                <th className="px-4 py-3 font-medium">Discount</th>
                <th className="px-4 py-3 font-medium">Products</th>
                <th className="px-4 py-3 font-medium">Window</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {campaigns.map((campaign) => {
                const phase = getFlashSaleCampaignPhase(campaign);
                const badge = PHASE_BADGE[phase];
                return (
                  <tr key={campaign.id} className="transition-colors hover:bg-accent/30">
                    <td className="px-4 py-3 font-medium">{campaign.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {campaign.discountType === "PERCENTAGE" ? `${campaign.discountValue}% off` : `GHS ${campaign.discountValue} off`}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{campaign.productSlugs.length}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDateTime(campaign.startsAt)} – {formatDateTime(campaign.endsAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/flash-sales/${campaign.id}/edit`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                        {(phase === "live" || phase === "upcoming") && (
                          <button
                            type="button"
                            onClick={() => handleCancel(campaign.id)}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(campaign.id, campaign.title)}
                          className="inline-flex items-center gap-1 text-sm font-medium text-destructive hover:underline"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
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
