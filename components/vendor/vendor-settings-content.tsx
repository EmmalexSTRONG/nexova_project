"use client";

import { useEffect, useState } from "react";
import { getVendorSettingsOverride, saveVendorSettingsOverride, type VendorShopSettings } from "@/lib/vendor/settings-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function VendorSettingsContent({ shopSlug, defaults }: { shopSlug: string; defaults: VendorShopSettings }) {
  const [form, setForm] = useState(defaults);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const override = getVendorSettingsOverride(shopSlug);
    if (override) setForm(override);
  }, [shopSlug]);

  function update<K extends keyof VendorShopSettings>(key: K, value: VendorShopSettings[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    saveVendorSettingsOverride(shopSlug, form);
    setSaved(true);
  }

  return (
    <div className="container max-w-2xl space-y-6 py-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage how your shop appears to customers.</p>
      </div>

      <Alert>
        <AlertDescription>
          Changes here are saved to this browser and shown when you reload this page. This demo build doesn&apos;t
          have a live database, so they won&apos;t yet appear on your public storefront page.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-5">
        <div className="space-y-2">
          <Label htmlFor="name">Shop name</Label>
          <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input id="tagline" value={form.tagline} onChange={(e) => update("tagline", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            rows={4}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit">Save changes</Button>
          {saved && <span className="text-sm text-success">Saved</span>}
        </div>
      </form>
    </div>
  );
}
