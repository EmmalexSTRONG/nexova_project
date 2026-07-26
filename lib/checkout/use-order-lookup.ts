"use client";

import { useEffect, useState } from "react";
import { getOrderByNumber, ORDERS_STORAGE_KEY } from "./order-store";
import type { PlacedOrder } from "./types";

export function useOrderLookup(orderNumber: string) {
  const [order, setOrder] = useState<PlacedOrder | null | undefined>(undefined);

  useEffect(() => {
    setOrder(getOrderByNumber(orderNumber));

    // Orders live in localStorage, so a status change made in another tab
    // (e.g. the vendor order management page) doesn't trigger a React
    // re-render here on its own — the storage event is what makes the
    // customer's tracking page update live without a manual refresh.
    function handleStorage(event: StorageEvent) {
      if (event.key === ORDERS_STORAGE_KEY || event.key === null) {
        setOrder(getOrderByNumber(orderNumber));
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [orderNumber]);

  return order; // undefined = still loading, null = not found
}
