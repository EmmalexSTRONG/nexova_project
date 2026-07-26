import type { ProductSpecification } from "@/lib/data";

export function SpecificationsTable({ specifications }: { specifications: ProductSpecification[] }) {
  return (
    <dl className="divide-y text-sm">
      {specifications.map((spec) => (
        <div key={spec.label} className="grid grid-cols-2 gap-4 py-2.5">
          <dt className="text-muted-foreground">{spec.label}</dt>
          <dd className="font-medium">{spec.value}</dd>
        </div>
      ))}
    </dl>
  );
}
