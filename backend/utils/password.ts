import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import { env } from "../utils/env";

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, env.BCRYPT_SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// Dummy hash used to compare against when a user isn't found, so login
// takes the same amount of time whether or not the email exists.
const DUMMY_HASH = "$2a$12$CwTycUXWue0Thq9StjUM0uJ8Ff.Xt5btqPnV9RwjNwOZzCPBwzOu2";

export function verifyPasswordConstantTime(plain: string, hash: string | null): Promise<boolean> {
  return bcrypt.compare(plain, hash ?? DUMMY_HASH);
}

// Ambiguous-looking characters (0/O, 1/l/I) excluded so a vendor reading this
// off a phone screen doesn't mistype it. Built to satisfy passwordSchema
// (upper + lower + digit, 8+ chars) by construction, then shuffled so the
// guaranteed characters aren't always in the same position.
const TEMP_PASSWORD_UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const TEMP_PASSWORD_LOWER = "abcdefghjkmnpqrstuvwxyz";
const TEMP_PASSWORD_DIGITS = "23456789";
const TEMP_PASSWORD_ALL = TEMP_PASSWORD_UPPER + TEMP_PASSWORD_LOWER + TEMP_PASSWORD_DIGITS;

function pickChar(chars: string): string {
  return chars[randomInt(chars.length)];
}

export function generateTemporaryPassword(length = 12): string {
  const required = [pickChar(TEMP_PASSWORD_UPPER), pickChar(TEMP_PASSWORD_LOWER), pickChar(TEMP_PASSWORD_DIGITS)];
  const rest = Array.from({ length: Math.max(0, length - required.length) }, () => pickChar(TEMP_PASSWORD_ALL));
  const chars = [...required, ...rest];

  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}
