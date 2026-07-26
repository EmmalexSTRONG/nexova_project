"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // The server always renders as if theme were "light" (it has no way to
  // know the real preference), while the blocking init script may have
  // already applied "dark" on the client before hydration runs. Rendering
  // the same "light" icon state until this component has mounted keeps the
  // first client render byte-identical to the server HTML, avoiding a
  // hydration mismatch — the correct icon takes over an instant later, and
  // since the *page's* colors were already correct from first paint (via
  // the init script), there's no visible flash, just this one icon settling.
  const isDark = mounted && theme === "dark";

  return (
    <div className="group relative inline-flex">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className,
        )}
      >
        <Sun
          className={cn(
            "absolute h-4 w-4 transition-all duration-300 ease-out",
            isDark ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100",
          )}
        />
        <Moon
          className={cn(
            "absolute h-4 w-4 transition-all duration-300 ease-out",
            isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0",
          )}
        />
      </button>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs font-medium text-ink-foreground opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        Switch Theme
      </span>
    </div>
  );
}
