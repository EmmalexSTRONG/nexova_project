"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminPagination({
  page,
  pageCount,
  totalCount,
  pageSize,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;

  const rangeStart = (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex items-center justify-between gap-4 border-t px-4 py-3 text-sm text-muted-foreground">
      <p>
        Showing <span className="font-medium text-foreground">{rangeStart}–{rangeEnd}</span> of{" "}
        <span className="font-medium text-foreground">{totalCount}</span>
      </p>
      <div className="flex items-center gap-1">
        <PageButton disabled={page === 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </PageButton>
        <span className="px-2 text-xs">
          Page {page} of {pageCount}
        </span>
        <PageButton disabled={page === pageCount} onClick={() => onPageChange(page + 1)} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </PageButton>
      </div>
    </div>
  );
}

function PageButton({
  children,
  disabled,
  onClick,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md border transition-colors",
        disabled ? "cursor-not-allowed opacity-40" : "hover:bg-accent hover:text-foreground",
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
