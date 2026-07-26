"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminLoadingState } from "@/components/admin/admin-loading-state";

// Shared "resolve an entity by slug/id, then show loading, not-found, or the
// edit form" shell — every admin edit page (blog post, category, flash-sale
// campaign) was hand-rolling an identical version of this.
export function AdminEntityEditShell<T>({
  entity,
  loadingLabel,
  notFoundMessage,
  backHref,
  backLabel,
  title,
  description,
  children,
}: {
  entity: T | null | undefined;
  loadingLabel: string;
  notFoundMessage: string;
  backHref: string;
  backLabel: string;
  title: string;
  description: (entity: T) => string;
  children: (entity: T) => React.ReactNode;
}) {
  if (entity === undefined) {
    return <AdminLoadingState label={loadingLabel} />;
  }

  if (entity === null) {
    return (
      <div className="space-y-4 p-16 text-center">
        <p className="text-sm text-muted-foreground">{notFoundMessage}</p>
        <Link href={backHref} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description(entity)}</p>
      </div>
      {children(entity)}
    </div>
  );
}
