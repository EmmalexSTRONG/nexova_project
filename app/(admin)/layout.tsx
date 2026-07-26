import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-pathname") ?? "";

  // /admin/login lives under this same route group but is a public page
  // (see middleware's ALWAYS_PUBLIC) — render it standalone, without the
  // authenticated dashboard chrome.
  if (pathname.startsWith("/admin/login")) return <>{children}</>;

  // Middleware already redirects any session-less request away from
  // /admin/* — this check is defense in depth against the same race a
  // session could expire in between the middleware and this render.
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <AdminShell userName={session.user.name ?? ""} userEmail={session.user.email ?? ""}>
      {children}
    </AdminShell>
  );
}
