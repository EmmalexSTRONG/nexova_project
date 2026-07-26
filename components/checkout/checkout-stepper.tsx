"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepDefinition {
  key: string;
  label: string;
}

export function CheckoutStepper({
  steps,
  currentIndex,
  completedIndexes,
  onStepClick,
}: {
  steps: StepDefinition[];
  currentIndex: number;
  completedIndexes: number[];
  onStepClick: (index: number) => void;
}) {
  return (
    <ol className="flex items-center gap-2 overflow-x-auto pb-2">
      {steps.map((step, index) => {
        const isCompleted = completedIndexes.includes(index);
        const isCurrent = index === currentIndex;
        const isClickable = isCompleted || isCurrent;

        return (
          <li key={step.key} className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(index)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                isCurrent && "border-primary bg-primary text-primary-foreground",
                !isCurrent && isCompleted && "border-success/40 bg-success/10 text-success",
                !isCurrent && !isCompleted && "border-border text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-xs",
                  isCurrent && "bg-primary-foreground text-primary",
                  !isCurrent && isCompleted && "bg-success text-success-foreground",
                  !isCurrent && !isCompleted && "bg-muted text-muted-foreground",
                )}
              >
                {isCompleted && !isCurrent ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              {step.label}
            </button>
            {index < steps.length - 1 && <span className="h-px w-6 shrink-0 bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}
