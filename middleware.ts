import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import type { UserRole } from "@/types";

const PROTECTED_PREFIXES: Array<{ prefix: string; roles: UserRole[]; loginPath: string }> = [
  { prefix: "/admin", roles: ["ADMIN", "SUPER_ADMIN"], loginPath: "/admin/login" },
  { prefix: "/vendor", roles: ["VENDOR"], loginPath: "/login" },
  { prefix: "/account", roles: ["CUSTOMER", "VENDOR", "ADMIN", "SUPER_ADMIN"], loginPath: "/login" },
];

// /admin/login must stay reachable without a session in every environment —
// its own loginPath falls under the "/admin" prefix it's nested in, so
// without this exception an unauthenticated visit redirects to itself and
// re-triggers this same middleware, looping forever.
const ALWAYS_PUBLIC = ["/admin/login"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Server Components have no built-in way to read the current pathname —
  // stash it in a header so route-group layouts (e.g. (admin)/layout.tsx)
  // can tell "/admin/login" apart from the rest of "/admin/*".
  const headers = new Headers(req.headers);
  headers.set("x-pathname", pathname);
  const withPathname = { request: { headers } };

  if (ALWAYS_PUBLIC.some((path) => pathname.startsWith(path))) {
    return NextResponse.next(withPathname);
  }

  const match = PROTECTED_PREFIXES.find((entry) => pathname.startsWith(entry.prefix));
  if (!match) return NextResponse.next(withPathname);

  const user = req.auth?.user;
  if (!user) {
    const loginUrl = new URL(match.loginPath, req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!match.roles.includes(user.role)) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  return NextResponse.next(withPathname);
});

export const config = {
  matcher: ["/admin/:path*", "/vendor/:path*", "/account/:path*"],
};
