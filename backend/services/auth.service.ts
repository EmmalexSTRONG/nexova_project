import { prisma, type User } from "../utils/prisma";
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  OauthUpsertInput,
  RegisterCustomerInput,
  RegisterVendorInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from "../utils/validators";
import type { AuthResponse, AuthUser, SessionSummary } from "../types";
import { env } from "../utils/env";
import { generateTemporaryPassword, hashPassword, verifyPassword, verifyPasswordConstantTime } from "../utils/password";
import { decodeAccessTokenExpirySeconds, signAccessToken } from "../utils/jwt";
import { generateSecureToken, hashToken } from "../utils/tokens";
import { sendPasswordResetEmail, sendVerificationEmail } from "../utils/mailer";
import { Errors } from "../utils/app-error";

export interface RequestMeta {
  ipAddress?: string;
  userAgent?: string;
}

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    avatarUrl: user.avatarUrl,
    emailVerified: user.emailVerified !== null,
  };
}

function assertLoginAllowed(user: User) {
  if (user.status === "BANNED") throw Errors.accountBanned();
  if (user.status === "SUSPENDED") throw Errors.accountSuspended();
}

async function issueSession(user: User, rememberMe: boolean, meta: RequestMeta): Promise<AuthResponse> {
  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });

  const refreshTokenRaw = generateSecureToken();
  const ttlDays = rememberMe ? env.REFRESH_TOKEN_TTL_DAYS_REMEMBER : env.REFRESH_TOKEN_TTL_DAYS;
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshTokenRaw),
      rememberMe,
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
      expiresAt,
    },
  });

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  return {
    user: toAuthUser(user),
    tokens: {
      accessToken,
      refreshToken: refreshTokenRaw,
      accessTokenExpiresIn: decodeAccessTokenExpirySeconds(),
    },
  };
}

async function createVerificationToken(userId: string) {
  const raw = generateSecureToken();
  const expiresAt = new Date(Date.now() + env.EMAIL_VERIFICATION_TOKEN_TTL_HOURS * 60 * 60 * 1000);
  await prisma.emailVerificationToken.create({
    data: { userId, tokenHash: hashToken(raw), expiresAt },
  });
  return raw;
}

export async function registerCustomer(input: RegisterCustomerInput, meta: RequestMeta): Promise<AuthResponse> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw Errors.emailInUse();

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash,
      role: "CUSTOMER",
    },
  });

  const token = await createVerificationToken(user.id);
  await sendVerificationEmail(user.email, user.name, token);

  return issueSession(user, false, meta);
}

export async function registerVendor(input: RegisterVendorInput, meta: RequestMeta): Promise<AuthResponse> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw Errors.emailInUse();

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        passwordHash,
        role: "VENDOR",
      },
    });
    await tx.vendorProfile.create({
      data: { userId: created.id, businessName: input.businessName, status: "PENDING" },
    });
    return created;
  });

  const token = await createVerificationToken(user.id);
  await sendVerificationEmail(user.email, user.name, token);

  return issueSession(user, false, meta);
}

export interface ActivateVendorFromApplicationInput {
  name: string;
  email: string;
  phone: string;
  businessName: string;
}

export interface ActivateVendorFromApplicationResult {
  alreadyExisted: boolean;
  temporaryPassword: string | null;
}

// Creates the real, login-capable account for a vendor whose subscription
// payment just succeeded. Deliberately doesn't reuse registerVendor: the
// applicant already proved ownership of their email through the vendor
// application's own verification link, so this skips issuing a *second*
// "verify your email" token/email and marks emailVerified immediately.
export async function activateVendorFromApplication(
  input: ActivateVendorFromApplicationInput,
): Promise<ActivateVendorFromApplicationResult> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    return { alreadyExisted: true, temporaryPassword: null };
  }

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        passwordHash,
        role: "VENDOR",
        emailVerified: new Date(),
      },
    });
    await tx.vendorProfile.create({
      data: { userId: user.id, businessName: input.businessName, status: "PENDING" },
    });
  });

  return { alreadyExisted: false, temporaryPassword };
}

export async function login(input: LoginInput, meta: RequestMeta): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  const valid = await verifyPasswordConstantTime(input.password, user?.passwordHash ?? null);
  if (!user || !valid) throw Errors.invalidCredentials();

  assertLoginAllowed(user);

  return issueSession(user, input.rememberMe ?? false, meta);
}

export async function adminLogin(input: LoginInput, meta: RequestMeta): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  const valid = await verifyPasswordConstantTime(input.password, user?.passwordHash ?? null);
  if (!user || !valid) throw Errors.invalidCredentials();

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") throw Errors.notAdmin();
  assertLoginAllowed(user);

  return issueSession(user, input.rememberMe ?? false, meta);
}

export async function refreshAccessToken(refreshTokenRaw: string, meta: RequestMeta): Promise<AuthResponse> {
  const tokenHash = hashToken(refreshTokenRaw);
  const existing = await prisma.refreshToken.findUnique({ where: { tokenHash }, include: { user: true } });

  if (!existing) throw Errors.invalidToken("refresh token");

  if (existing.revokedAt) {
    // Reuse of a rotated-out token is a strong signal of theft: kill every
    // session for this user and force re-authentication everywhere.
    await prisma.refreshToken.updateMany({
      where: { userId: existing.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw Errors.invalidToken("refresh token");
  }

  if (existing.expiresAt < new Date()) throw Errors.invalidToken("refresh token");

  assertLoginAllowed(existing.user);

  const accessToken = signAccessToken({
    sub: existing.user.id,
    email: existing.user.email,
    role: existing.user.role,
  });

  const newRefreshRaw = generateSecureToken();
  const ttlDays = existing.rememberMe ? env.REFRESH_TOKEN_TTL_DAYS_REMEMBER : env.REFRESH_TOKEN_TTL_DAYS;
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    const replacement = await tx.refreshToken.create({
      data: {
        userId: existing.userId,
        tokenHash: hashToken(newRefreshRaw),
        rememberMe: existing.rememberMe,
        userAgent: meta.userAgent ?? existing.userAgent,
        ipAddress: meta.ipAddress ?? existing.ipAddress,
        expiresAt,
      },
    });
    await tx.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date(), replacedBy: replacement.id },
    });
  });

  return {
    user: toAuthUser(existing.user),
    tokens: {
      accessToken,
      refreshToken: newRefreshRaw,
      accessTokenExpiresIn: decodeAccessTokenExpirySeconds(),
    },
  };
}

export async function logout(refreshTokenRaw: string): Promise<void> {
  const tokenHash = hashToken(refreshTokenRaw);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function logoutAll(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function listSessions(userId: string, currentRefreshTokenRaw?: string): Promise<SessionSummary[]> {
  const currentHash = currentRefreshTokenRaw ? hashToken(currentRefreshTokenRaw) : undefined;
  const sessions = await prisma.refreshToken.findMany({
    where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { lastUsedAt: "desc" },
  });

  return sessions.map((s) => ({
    id: s.id,
    userAgent: s.userAgent,
    ipAddress: s.ipAddress,
    rememberMe: s.rememberMe,
    createdAt: s.createdAt.toISOString(),
    lastUsedAt: s.lastUsedAt.toISOString(),
    expiresAt: s.expiresAt.toISOString(),
    current: s.tokenHash === currentHash,
  }));
}

export async function revokeSession(userId: string, sessionId: string): Promise<void> {
  const session = await prisma.refreshToken.findUnique({ where: { id: sessionId } });
  if (!session || session.userId !== userId) throw Errors.notFound("Session");

  await prisma.refreshToken.update({ where: { id: sessionId }, data: { revokedAt: new Date() } });
}

export async function verifyEmail(rawToken: string): Promise<void> {
  const tokenHash = hashToken(rawToken);
  const record = await prisma.emailVerificationToken.findUnique({ where: { tokenHash } });

  if (!record || record.expiresAt < new Date()) {
    throw Errors.invalidToken("verification token");
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerified: new Date() } }),
    prisma.emailVerificationToken.deleteMany({ where: { userId: record.userId } }),
  ]);
}

export async function resendVerification(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.emailVerified) return; // Silent no-op: avoid leaking account existence/state.

  await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });
  const token = await createVerificationToken(user.id);
  await sendVerificationEmail(user.email, user.name, token);
}

export async function forgotPassword(input: ForgotPasswordInput): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) return; // Silent no-op: avoid user enumeration.

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });

  const raw = generateSecureToken();
  const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_TOKEN_TTL_MINUTES * 60 * 1000);
  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash: hashToken(raw), expiresAt },
  });

  await sendPasswordResetEmail(user.email, user.name, raw);
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  const tokenHash = hashToken(input.token);
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw Errors.invalidToken("reset token");
  }

  const passwordHash = await hashPassword(input.password);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}

export async function getMe(userId: string): Promise<AuthUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw Errors.notFound("User");
  return toAuthUser(user);
}

export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<AuthUser> {
  const current = await prisma.user.findUnique({ where: { id: userId } });
  if (!current) throw Errors.notFound("User");

  const emailChanged = input.email !== current.email;
  if (emailChanged) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw Errors.emailInUse();
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      email: input.email,
      // The new address hasn't been proven to belong to this user yet —
      // require re-verification, same as at registration.
      ...(emailChanged ? { emailVerified: null } : {}),
    },
  });

  if (emailChanged) {
    const token = await createVerificationToken(updated.id);
    await sendVerificationEmail(updated.email, updated.name, token);
  }

  return toAuthUser(updated);
}

export async function changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw Errors.notFound("User");

  const valid = user.passwordHash ? await verifyPassword(input.currentPassword, user.passwordHash) : false;
  if (!valid) throw Errors.incorrectPassword();

  const passwordHash = await hashPassword(input.newPassword);

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    // A password change ends every other session — containment in case the
    // old password was compromised.
    prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}

export async function oauthUpsert(input: OauthUpsertInput, meta: RequestMeta): Promise<AuthResponse> {
  const providerAccount = await prisma.account.findUnique({
    where: { provider_providerAccountId: { provider: input.provider, providerAccountId: input.providerAccountId } },
    include: { user: true },
  });

  let user: User;

  if (providerAccount) {
    user = providerAccount.user;
  } else {
    const existingByEmail = await prisma.user.findUnique({ where: { email: input.email } });

    user = await prisma.$transaction(async (tx) => {
      const resolvedUser =
        existingByEmail ??
        (await tx.user.create({
          data: {
            name: input.name,
            email: input.email,
            avatarUrl: input.avatarUrl,
            role: "CUSTOMER",
            emailVerified: new Date(), // OAuth providers verify email ownership themselves.
          },
        }));

      await tx.account.create({
        data: {
          userId: resolvedUser.id,
          type: "oauth",
          provider: input.provider,
          providerAccountId: input.providerAccountId,
        },
      });

      return resolvedUser;
    });
  }

  assertLoginAllowed(user);
  return issueSession(user, false, meta);
}
