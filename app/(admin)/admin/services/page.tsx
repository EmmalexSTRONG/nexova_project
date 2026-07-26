import { Wrench } from "lucide-react";
import { services } from "@/lib/data";
import { getServiceIcon } from "@/lib/icon-map";
import { Price } from "@/components/shared/price";
import { StarRating } from "@/components/shared/star-rating";
import { ProductImage } from "@/components/shared/product-image";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";

export default function AdminServicesPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Services</h1>
        <p className="text-sm text-muted-foreground">{services.length} bookable services listed on Nexora.</p>
      </div>

      {services.length === 0 ? (
        <AdminEmptyState icon={Wrench} title="No services yet" />
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">Provider</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {services.map((service) => {
                const Icon = getServiceIcon(service.seed);
                return (
                  <tr key={service.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductImage image={service.image} seed={service.seed} icon={Icon} alt={service.name} className="h-10 w-10 shrink-0 rounded-md" iconClassName="h-1/2 w-1/2" />
                        <span className="font-medium">{service.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{service.providerName}</td>
                    <td className="px-4 py-3">
                      <Price amount={service.price} currency={service.currency} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{service.durationLabel}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={service.rating} />
                        <span className="text-xs text-muted-foreground">({service.reviewCount})</span>
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
