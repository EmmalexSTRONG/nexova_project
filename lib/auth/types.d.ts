import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/types";

declare module "next-auth" {
  interface User {
    role: UserRole;
    isEmailVerified: boolean;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: number;
    rememberMe: boolean;
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
      isEmailVerified: boolean;
    };
    accessToken?: string;
    refreshToken?: string;
    error?: "RefreshFailed";
  }
}
