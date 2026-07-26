import jwt from "jsonwebtoken";
import type { JwtAccessPayload, UserRole } from "../types";
import { env } from "../utils/env";

export function signAccessToken(payload: { sub: string; email: string; role: UserRole }): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): JwtAccessPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAccessPayload;
}

export function decodeAccessTokenExpirySeconds(): number {
  const match = /^(\d+)([smhd])$/.exec(env.JWT_ACCESS_EXPIRES_IN);
  if (!match) return 900;
  const value = Number(match[1]);
  const unit = match[2];
  const multiplier = { s: 1, m: 60, h: 3600, d: 86400 }[unit] ?? 60;
  return value * multiplier;
}
