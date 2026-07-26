import { ShieldCheck } from "lucide-react";
import type { StorePolicy } from "@/lib/data";

export function StorePolicies({ policies }: { policies: StorePolicy[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {policies.map((policy) => (
        <div key={policy.title} className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-success" />
            <h3 className="font-display text-sm font-semibold">{policy.title}</h3>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{policy.description}</p>
        </div>
      ))}
    </div>
  );
}
