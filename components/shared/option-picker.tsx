"use client";

import { cn } from "@/lib/utils";

export interface OptionPickerChoice<T extends string> {
  value: T;
  label: string;
  description?: string;
}

const COLUMNS_CLASS: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

// A mutually-exclusive button group with real radio semantics (role,
// aria-checked, arrow-key roving) — used anywhere a set of "pick exactly
// one" options was previously a plain row of buttons with only visual,
// not assistive-tech-visible, selection state.
export function OptionPicker<T extends string>({
  options,
  value,
  onChange,
  label,
  columns = options.length,
}: {
  options: OptionPickerChoice<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  columns?: number;
}) {
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) return;
    event.preventDefault();
    const currentIndex = options.findIndex((option) => option.value === value);
    const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    const nextIndex = (currentIndex + direction + options.length) % options.length;
    onChange(options[nextIndex].value);
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className={cn("grid gap-2", COLUMNS_CLASS[columns] ?? "grid-cols-1")}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-lg border p-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              selected ? "border-primary bg-primary/5" : "hover:bg-muted/40",
            )}
          >
            <p className="text-sm font-medium">{option.label}</p>
            {option.description && <p className="text-xs text-muted-foreground">{option.description}</p>}
          </button>
        );
      })}
    </div>
  );
}
