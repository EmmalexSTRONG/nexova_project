"use client";

import { useEffect, useState } from "react";
import { Search, Users } from "lucide-react";
import type { UserRole } from "@/types";
import { getSiteOrders, getPlatformCustomers, getVendorUsers } from "@/lib/admin/dashboard-data";
import { getRoleOverride, setRoleOverride } from "@/lib/admin/user-role-store";
import { ORDERS_STORAGE_KEY } from "@/lib/checkout/order-store";
import type { PlacedOrder } from "@/lib/checkout/types";
import { Badge } from "@/components/ui/badge";
import { AdminEmptyState } from "./admin-empty-state";
import { AdminLoadingState } from "./admin-loading-state";

interface UserRow {
  email: string;
  name: string;
  defaultRole: UserRole;
  detail: string;
}

const ROLE_OPTIONS: UserRole[] = ["CUSTOMER", "VENDOR", "ADMIN", "SUPER_ADMIN"];

function initialsFor(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

export function AdminUsersContent() {
  const [orders, setOrders] = useState<PlacedOrder[] | undefined>(undefined);
  const [query, setQuery] = useState("");
  const [, forceRerender] = useState(0);

  useEffect(() => {
    function load() {
      setOrders(getSiteOrders());
    }
    load();
    function handleStorage(event: StorageEvent) {
      if (event.key === ORDERS_STORAGE_KEY || event.key === null) load();
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  if (orders === undefined) {
    return <AdminLoadingState label="Loading users..." />;
  }

  const customerUsers: UserRow[] = getPlatformCustomers(orders).map((c) => ({
    email: c.email,
    name: c.name,
    defaultRole: "CUSTOMER",
    detail: `${c.orderCount} order${c.orderCount === 1 ? "" : "s"}`,
  }));
  const vendorUsers: UserRow[] = getVendorUsers().map((v) => ({
    email: v.email,
    name: v.name,
    defaultRole: "VENDOR",
    detail: v.shopName,
  }));

  const allUsers = [...vendorUsers, ...customerUsers];
  const needle = query.trim().toLowerCase();
  const visible = allUsers.filter(
    (user) => !needle || user.name.toLowerCase().includes(needle) || user.email.toLowerCase().includes(needle),
  );

  function handleRoleChange(email: string, role: UserRole) {
    setRoleOverride(email, role);
    forceRerender((n) => n + 1);
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            Every account that has interacted with the platform — customers who&apos;ve ordered, and vendors behind
            each shop.
          </p>
        </div>
        {allUsers.length > 0 && (
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or email..."
              className="h-9 w-56 rounded-md border border-input bg-background pl-8 pr-2 text-sm placeholder:text-muted-foreground"
            />
          </div>
        )}
      </div>

      {allUsers.length === 0 ? (
        <AdminEmptyState icon={Users} title="No users yet" />
      ) : visible.length === 0 ? (
        <AdminEmptyState icon={Search} title="No users match" description="Try a different name or email." />
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Detail</th>
                <th className="px-4 py-3 font-medium">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((user) => {
                const currentRole = getRoleOverride(user.email) ?? user.defaultRole;
                return (
                  <tr key={user.email} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5 font-medium">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-primary">
                          {initialsFor(user.name)}
                        </span>
                        {user.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{user.detail}</td>
                    <td className="px-4 py-3">
                      <select
                        value={currentRole}
                        onChange={(e) => handleRoleChange(user.email, e.target.value as UserRole)}
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                      >
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      {getRoleOverride(user.email) && (
                        <Badge variant="outline" className="ml-2 text-[10px]">
                          Overridden
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
