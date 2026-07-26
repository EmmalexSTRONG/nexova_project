"use client";

import { useId } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, inverted = true }: { className?: string; inverted?: boolean }) {
  const gradientId = useId();

  return (
    <Link
      href="/"
      className={cn(
        "group flex items-center gap-2 font-display text-xl font-bold tracking-tight",
        inverted ? "text-ink-foreground" : "text-foreground",
        className,
      )}
    >
      <svg
        viewBox="0 0 40 40"
        className="h-8 w-8 shrink-0 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${gradientId}-gold`} x1="4" y1="6" x2="36" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFD98C" />
            <stop offset="45%" stopColor="#F0A93C" />
            <stop offset="100%" stopColor="#C97F1A" />
          </linearGradient>
        </defs>

        {/* circuit traces feeding into the cart */}
        <g stroke={`url(#${gradientId}-gold)`} strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.85">
          <path d="M2 12 H9" />
          <path d="M2 17 H7" />
          <path d="M2 22 H9" />
          <circle cx="2" cy="12" r="1.3" fill={`url(#${gradientId}-gold)`} stroke="none" />
          <circle cx="2" cy="17" r="1.1" fill={`url(#${gradientId}-gold)`} stroke="none" />
          <circle cx="2" cy="22" r="1.3" fill={`url(#${gradientId}-gold)`} stroke="none" />
        </g>

        {/* cart body, doubling as an angular "N" */}
        <path
          d="M9 10 H13 L16.5 25 H30.5 L34 14 H17.5"
          stroke={`url(#${gradientId}-gold)`}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="19.5" cy="31" r="2.4" fill={`url(#${gradientId}-gold)`} />
        <circle cx="29" cy="31" r="2.4" fill={`url(#${gradientId}-gold)`} />
      </svg>

      <span>
        NE<span className="text-primary">X</span>ORA
      </span>
    </Link>
  );
}
