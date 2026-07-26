import {
  Box,
  CheckCircle2,
  CreditCard,
  Loader,
  type LucideIcon,
  Navigation,
  PackageCheck,
  Store,
  Truck,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getStatusSequence, ORDER_STATUS_DESCRIPTION, ORDER_STATUS_LABEL } from "@/lib/checkout/order-status";
import type { OrderStatus, PlacedOrder } from "@/lib/checkout/types";

const STATUS_ICON: Record<OrderStatus, LucideIcon> = {
  ORDER_RECEIVED: PackageCheck,
  PAYMENT_CONFIRMED: CreditCard,
  PROCESSING: Loader,
  PACKING: Box,
  READY_FOR_PICKUP: Store,
  DISPATCHED: Truck,
  OUT_FOR_DELIVERY: Navigation,
  DELIVERED: CheckCircle2,
  CANCELLED: XCircle,
};

export function OrderStatusTimeline({ order }: { order: PlacedOrder }) {
  const sequence = getStatusSequence(order.fulfillment);
  const historyByStatus = new Map(order.statusHistory.map((event) => [event.status, event.timestamp]));

  const isCancelled = order.status === "CANCELLED";
  // When cancelled, everything up to the last non-cancelled status the order
  // reached before cancellation still shows as completed.
  const lastReachedStatus = isCancelled
    ? [...order.statusHistory].reverse().find((event) => event.status !== "CANCELLED")?.status
    : order.status;
  const currentIndex = lastReachedStatus ? sequence.indexOf(lastReachedStatus) : -1;

  const steps = sequence.map((status, index) => ({
    status,
    timestamp: historyByStatus.get(status),
    isComplete: index <= currentIndex,
    isCurrent: index === currentIndex && !isCancelled,
  }));

  return (
    <div>
      {isCancelled && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-semibold text-destructive">Order cancelled</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {historyByStatus.get("CANCELLED") && new Date(historyByStatus.get("CANCELLED")!).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      <ol>
        {steps.map((step, index) => {
          const Icon = STATUS_ICON[step.status];
          const isLast = index === steps.length - 1;
          return (
            <li key={step.status} className="relative flex gap-4 pb-8 last:pb-0">
              {!isLast && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-px",
                    step.isComplete && !isCancelled ? "bg-primary" : "bg-border",
                  )}
                />
              )}
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 z-10",
                  step.isCurrent && "border-primary bg-primary text-primary-foreground",
                  step.isComplete && !step.isCurrent && "border-primary bg-primary/10 text-primary",
                  !step.isComplete && "border-border bg-background text-muted-foreground",
                  isCancelled && step.isComplete && "border-muted-foreground/40 bg-muted text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="pt-1">
                <p
                  className={cn(
                    "text-sm font-medium",
                    !step.isComplete && "text-muted-foreground",
                    isCancelled && step.isComplete && "text-muted-foreground",
                  )}
                >
                  {ORDER_STATUS_LABEL[step.status]}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {step.timestamp
                    ? new Date(step.timestamp).toLocaleString()
                    : step.isCurrent
                      ? ORDER_STATUS_DESCRIPTION[step.status]
                      : "Pending"}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
