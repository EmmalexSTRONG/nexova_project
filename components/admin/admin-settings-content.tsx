"use client";

import { useEffect, useState } from "react";
import { updateProfileAction, changePasswordAction } from "@/lib/auth/actions";
import { DEFAULT_PLATFORM_SETTINGS, getPlatformSettings, savePlatformSettings, type PlatformSettings } from "@/lib/admin/settings-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AdminSettingsContent({ userName, userEmail }: { userName: string; userEmail: string }) {
  return (
    <div className="max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Your account and platform-wide configuration.</p>
      </div>

      <AccountForm userName={userName} userEmail={userEmail} />
      <PasswordForm />
      <PlatformSettingsForm />
    </div>
  );
}

function AccountForm({ userName, userEmail }: { userName: string; userEmail: string }) {
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [status, setStatus] = useState<{ tone: "success" | "destructive"; message: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setStatus(null);
    setFieldErrors({});

    const result = await updateProfileAction({ name, email });

    if (!result.success) {
      setFieldErrors(result.fieldErrors ?? {});
      setStatus({ tone: "destructive", message: result.message ?? "Couldn't save your changes." });
    } else {
      setStatus({ tone: "success", message: result.message ?? "Profile updated." });
    }
    setIsSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-5">
      <div>
        <h2 className="font-display text-base font-semibold">Your account</h2>
        <p className="text-sm text-muted-foreground">The name and email tied to your admin login.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="adminName">Name</Label>
        <Input id="adminName" value={name} onChange={(e) => setName(e.target.value)} />
        {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="adminEmail">Email</Label>
        <Input id="adminEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email[0]}</p>}
      </div>

      {status && (
        <Alert variant={status.tone}>
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}

const EMPTY_PASSWORD_FORM = { currentPassword: "", newPassword: "", confirmPassword: "" };

function PasswordForm() {
  const [form, setForm] = useState(EMPTY_PASSWORD_FORM);
  const [status, setStatus] = useState<{ tone: "success" | "destructive"; message: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setStatus(null);
    setFieldErrors({});

    const result = await changePasswordAction(form);

    if (!result.success) {
      setFieldErrors(result.fieldErrors ?? {});
      setStatus({ tone: "destructive", message: result.message ?? "Couldn't change your password." });
    } else {
      setStatus({ tone: "success", message: result.message ?? "Password changed." });
      setForm(EMPTY_PASSWORD_FORM);
    }
    setIsSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-5">
      <div>
        <h2 className="font-display text-base font-semibold">Change password</h2>
        <p className="text-sm text-muted-foreground">Changing your password signs you out of every other session.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          value={form.currentPassword}
          onChange={(e) => setForm((current) => ({ ...current, currentPassword: e.target.value }))}
        />
        {fieldErrors.currentPassword && <p className="text-xs text-destructive">{fieldErrors.currentPassword[0]}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="newPassword">New password</Label>
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            value={form.newPassword}
            onChange={(e) => setForm((current) => ({ ...current, newPassword: e.target.value }))}
          />
          {fieldErrors.newPassword && <p className="text-xs text-destructive">{fieldErrors.newPassword[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(e) => setForm((current) => ({ ...current, confirmPassword: e.target.value }))}
          />
          {fieldErrors.confirmPassword && <p className="text-xs text-destructive">{fieldErrors.confirmPassword[0]}</p>}
        </div>
      </div>

      {status && (
        <Alert variant={status.tone}>
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Changing..." : "Change password"}
      </Button>
    </form>
  );
}

function PlatformSettingsForm() {
  const [form, setForm] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(getPlatformSettings());
  }, []);

  function update<K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    savePlatformSettings(form);
    setSaved(true);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-base font-semibold">Platform settings</h2>
        <p className="text-sm text-muted-foreground">Site-wide configuration, not tied to your personal account.</p>
      </div>

      <Alert>
        <AlertDescription>
          Saved to this browser. This demo build doesn&apos;t have a live database, so these values aren&apos;t
          shared across devices.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-5">
        <div className="space-y-2">
          <Label htmlFor="siteName">Site name</Label>
          <Input id="siteName" value={form.siteName} onChange={(e) => update("siteName", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supportEmail">Support email</Label>
          <Input id="supportEmail" type="email" value={form.supportEmail} onChange={(e) => update("supportEmail", e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" value={form.currency} onChange={(e) => update("currency", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="commissionPercent">Platform commission (%)</Label>
            <Input
              id="commissionPercent"
              type="number"
              min={0}
              max={100}
              value={form.commissionPercent}
              onChange={(e) => update("commissionPercent", Number(e.target.value))}
            />
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
