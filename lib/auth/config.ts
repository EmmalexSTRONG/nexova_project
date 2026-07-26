import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import type { JWT } from "next-auth/jwt";
import { loginSchema } from "@/lib/validators";
import type { AuthResponse, UserRole } from "@/types";
import { expressFetch, expressInternalFetch } from "../api/express";

const REMEMBER_ME_SESSION_SECONDS = 30 * 24 * 60 * 60; // 30 days
const DEFAULT_SESSION_SECONDS = 24 * 60 * 60; // 1 day

// The `next-auth/jwt` `JWT` type doesn't reliably pick up ambient module
// augmentation in this beta (it's a re-export shim, not the declaring
// module), so the extra fields we stash on the token are typed explicitly
// here and applied via a cast instead of relying on merging.
interface AppJwt extends JWT {
  role?: UserRole;
  isEmailVerified?: boolean;
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresAt?: number;
  rememberMe?: boolean;
  error?: "RefreshFailed";
}

async function refreshExpressSession(refreshToken: string) {
  const result = await expressFetch<AuthResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
  if (!result.success) throw new Error(result.error.message);
  return result.data;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: REMEMBER_ME_SESSION_SECONDS },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember me", type: "text" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse({
          email: credentials?.email,
          password: credentials?.password,
          rememberMe: credentials?.rememberMe === "true",
        });
        if (!parsed.success) return null;

        const result = await expressFetch<AuthResponse>("/auth/login", {
          method: "POST",
          body: JSON.stringify(parsed.data),
        });
        if (!result.success) return null;

        const { user, tokens } = result.data;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
          role: user.role,
          isEmailVerified: user.emailVerified,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          accessTokenExpiresAt: Date.now() + tokens.accessTokenExpiresIn * 1000,
          rememberMe: parsed.data.rememberMe,
        };
      },
    }),
    Credentials({
      id: "admin-credentials",
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember me", type: "text" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse({
          email: credentials?.email,
          password: credentials?.password,
          rememberMe: credentials?.rememberMe === "true",
        });
        if (!parsed.success) return null;

        const result = await expressFetch<AuthResponse>("/auth/admin/login", {
          method: "POST",
          body: JSON.stringify(parsed.data),
        });
        if (!result.success) return null;

        const { user, tokens } = result.data;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
          role: user.role,
          isEmailVerified: user.emailVerified,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          accessTokenExpiresAt: Date.now() + tokens.accessTokenExpiresIn * 1000,
          rememberMe: parsed.data.rememberMe,
        };
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token: rawToken, user, account }) {
      const token = rawToken as AppJwt;

      if (user && account?.type === "credentials") {
        token.sub = user.id;
        token.role = user.role;
        token.isEmailVerified = user.isEmailVerified;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpiresAt = user.accessTokenExpiresAt;
        token.rememberMe = user.rememberMe;
        token.exp = Math.floor(Date.now() / 1000) + (user.rememberMe ? REMEMBER_ME_SESSION_SECONDS : DEFAULT_SESSION_SECONDS);
      } else if (user && account && (account.provider === "google" || account.provider === "facebook")) {
        const upserted = await expressInternalFetch<AuthResponse>("/auth/oauth/upsert", {
          method: "POST",
          body: JSON.stringify({
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            email: user.email,
            name: user.name ?? "New User",
            avatarUrl: user.image ?? undefined,
          }),
        });
        if (!upserted.success) return { ...token, error: "RefreshFailed" };

        token.sub = upserted.data.user.id;
        token.role = upserted.data.user.role;
        token.isEmailVerified = upserted.data.user.emailVerified;
        token.accessToken = upserted.data.tokens.accessToken;
        token.refreshToken = upserted.data.tokens.refreshToken;
        token.accessTokenExpiresAt = Date.now() + upserted.data.tokens.accessTokenExpiresIn * 1000;
        token.rememberMe = false;
        token.exp = Math.floor(Date.now() / 1000) + DEFAULT_SESSION_SECONDS;
      } else if (
        token.accessToken &&
        token.accessTokenExpiresAt &&
        Date.now() > token.accessTokenExpiresAt - 60_000 &&
        token.refreshToken
      ) {
        try {
          const refreshed = await refreshExpressSession(token.refreshToken);
          token.accessToken = refreshed.tokens.accessToken;
          token.refreshToken = refreshed.tokens.refreshToken;
          token.accessTokenExpiresAt = Date.now() + refreshed.tokens.accessTokenExpiresIn * 1000;
          delete token.error;
        } catch {
          token.error = "RefreshFailed";
        }
      }

      return token;
    },
    async session({ session, token: rawToken }) {
      const token = rawToken as AppJwt;
      session.user.id = token.sub ?? "";
      session.user.role = token.role ?? "CUSTOMER";
      session.user.isEmailVerified = token.isEmailVerified ?? false;
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.error = token.error;
      return session;
    },
  },
});
