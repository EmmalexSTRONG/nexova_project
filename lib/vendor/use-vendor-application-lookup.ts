"use client";

import { useEffect, useState } from "react";
import { getVendorApplicationById, VENDOR_APPLICATIONS_STORAGE_KEY } from "./vendor-application-store";
import type { VendorApplication } from "./vendor-application-types";

export function useVendorApplicationLookup(id: string) {
  const [application, setApplication] = useState<VendorApplication | null | undefined>(undefined);

  useEffect(() => {
    setApplication(getVendorApplicationById(id));

    function handleStorage(event: StorageEvent) {
      if (event.key === VENDOR_APPLICATIONS_STORAGE_KEY || event.key === null) {
        setApplication(getVendorApplicationById(id));
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [id]);

  return application;
}
