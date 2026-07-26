import Link from "next/link";
import { Globe, ShieldCheck, Store, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ROUTE_RULES = [
  {
    area: "/admin/*",
    icon: ShieldCheck,
    roles: ["ADMIN", "SUPER_ADMIN"],
    description: "Platform administration — this dashboard.",
  },
  {
    area: "/vendor/*",
    icon: Store,
    roles: ["VENDOR"],
    description: "Shop management dashboard.",
  },
  {
    area: "/account/*",
    icon: User,
    roles: ["CUSTOMER", "VENDOR", "ADMIN", "SUPER_ADMIN"],
    description: "Personal account, orders, and session management.",
  },
  {
    area: "Storefront",
    routeHint: "/, /products, /vendors, /cart, /checkout...",
    icon: Globe,
    roles: ["CUSTOMER", "VENDOR", "ADMIN", "SUPER_ADMIN", "Signed out"],
    description: "Public marketplace — browsing and checkout require no specific role.",
  },
] as const;

const ROLE_STYLE: Record<string, BadgeProps["variant"]> = {
  SUPER_ADMIN: "default",
  ADMIN: "ink",
  VENDOR: "secondary",
  CUSTOMER: "outline",
  "Signed out": "outline",
};

export default function AdminPermissionsPage() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Permissions</h1>
        <p className="text-sm text-muted-foreground">
          What each role can access, enforced by the app&apos;s route middleware.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Area</th>
                <th className="px-5 py-3">Allowed roles</th>
                <th className="px-5 py-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {ROUTE_RULES.map((rule) => (
                <tr key={rule.area} className="align-top transition-colors hover:bg-muted/30">
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <AreaIcon icon={rule.icon} />
                      <div className="min-w-0">
                        <code className="block w-fit rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-medium text-foreground">
                          {rule.area}
                        </code>
                        {"routeHint" in rule && (
                          <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">{rule.routeHint}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {rule.roles.map((role) => (
                        <Badge key={role} variant={ROLE_STYLE[role] ?? "outline"} className={cn(role === "Signed out" && "font-normal italic text-muted-foreground")}>
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{rule.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-lg border bg-card p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-medium">Changing an individual user&apos;s role</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Role assignments per user are managed from the{" "}
            <Link href="/admin/users" className="font-medium text-primary hover:underline">
              Users
            </Link>{" "}
            page.
          </p>
        </div>
      </div>
    </div>
  );
}

function AreaIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
      <Icon className="h-4 w-4" />
    </span>
  );
}
