"use client";

import { useCallback, useEffect, useState } from "react";
import { getPushSubscription, removePushSubscription, savePushSubscription } from "./push-store";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export type PushPermissionState = "unsupported" | "default" | "denied" | "granted" | "subscribed";

export function usePushSubscription(email: string | undefined) {
  const [state, setState] = useState<PushPermissionState>("default");
  const [isBusy, setIsBusy] = useState(false);

  const isSupported = typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;

  useEffect(() => {
    if (!isSupported) {
      setState("unsupported");
      return;
    }
    if (!email) return;

    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }
    if (getPushSubscription(email)) {
      setState("subscribed");
      return;
    }
    setState(Notification.permission === "granted" ? "granted" : "default");
  }, [email, isSupported]);

  const subscribe = useCallback(async () => {
    if (!isSupported || !email || !VAPID_PUBLIC_KEY) return;
    setIsBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "default");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });

      const json = subscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        throw new Error("Push subscription is missing required fields");
      }

      savePushSubscription(email, {
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      });
      setState("subscribed");
    } finally {
      setIsBusy(false);
    }
  }, [email, isSupported]);

  const unsubscribe = useCallback(async () => {
    if (!email) return;
    setIsBusy(true);
    try {
      if (isSupported) {
        const registration = await navigator.serviceWorker.getRegistration("/sw.js");
        const subscription = await registration?.pushManager.getSubscription();
        await subscription?.unsubscribe();
      }
      removePushSubscription(email);
      setState("granted");
    } finally {
      setIsBusy(false);
    }
  }, [email, isSupported]);

  return { state, isBusy, subscribe, unsubscribe, isSupported };
}
