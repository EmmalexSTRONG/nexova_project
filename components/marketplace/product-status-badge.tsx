import type { ProductStatus } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG: Record<ProductStatus, { label: string; variant: "success" | "secondary" | "sale" | "outline" }> = {
  ACTIVE: { label: "Active", variant: "success" },
  DRAFT: { label: "Draft", variant: "outline" },
  INACTIVE: { label: "Inactive", variant: "secondary" },
  OUT_OF_STOCK: { label: "Out of stock", variant: "sale" },
  ARCHIVED: { label: "Discontinued", variant: "secondary" },
};

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
