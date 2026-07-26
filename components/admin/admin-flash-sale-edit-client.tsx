"use client";

import { FLASH_SALE_CAMPAIGNS_STORAGE_KEY, getFlashSaleCampaignById, type FlashSaleCampaign } from "@/lib/admin/flash-sale-store";
import { useResolvedEntity } from "@/lib/shared/use-resolved-entity";
import { AdminFlashSaleForm } from "@/components/admin/admin-flash-sale-form";
import { AdminEntityEditShell } from "@/components/admin/admin-entity-edit-shell";

export function AdminFlashSaleEditClient({ id }: { id: string }) {
  const campaign = useResolvedEntity<FlashSaleCampaign>(
    () => getFlashSaleCampaignById(id),
    [FLASH_SALE_CAMPAIGNS_STORAGE_KEY, id],
  );

  return (
    <AdminEntityEditShell
      entity={campaign}
      loadingLabel="Loading campaign..."
      notFoundMessage="This campaign couldn't be found."
      backHref="/admin/flash-sales"
      backLabel="Back to flash sales"
      title="Edit campaign"
      description={(resolved) => `Update "${resolved.title}".`}
    >
      {(resolved) => <AdminFlashSaleForm campaign={resolved} />}
    </AdminEntityEditShell>
  );
}
