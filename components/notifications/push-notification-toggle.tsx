"use client";

import { Bell, BellOff, BellRing, Loader2 } from "lucide-react";
import { usePushSubscription } from "@/lib/notifications/use-push-subscription";
import { Button } from "@/components/ui/button";

export function PushNotificationToggle({ email }: { email: string }) {
  const { state, isBusy, subscribe, unsubscribe, isSupported } = usePushSubscription(email);

  if (!isSupported || state === "unsupported") return null;

  if (state === "denied") {
    return (
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <BellOff className="h-3.5 w-3.5" />
        Push notifications are blocked in your browser settings.
      </p>
    );
  }

  if (state === "subscribed") {
    return (
      <Button type="button" variant="outline" size="sm" onClick={unsubscribe} disabled={isBusy}>
        {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BellRing className="h-3.5 w-3.5" />}
        Push notifications on
      </Button>
    );
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={subscribe} disabled={isBusy}>
      {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bell className="h-3.5 w-3.5" />}
      Get push notifications for this order
    </Button>
  );
}
