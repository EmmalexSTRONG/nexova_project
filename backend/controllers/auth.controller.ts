import type { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { Errors } from "../utils/app-error";
import type { RequestMeta } from "../services/auth.service";

function meta(req: Request): RequestMeta {
  return {
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  };
}

export async function registerCustomer(req: Request, res: Response) {
  const result = await authService.registerCustomer(req.body, meta(req));
  res.status(201).json({ success: true, data: result });
}

export async function registerVendor(req: Request, res: Response) {
  const result = await authService.registerVendor(req.body, meta(req));
  res.status(201).json({ success: true, data: result });
}

export async function login(req: Request, res: Response) {
  const result = await authService.login(req.body, meta(req));
  res.status(200).json({ success: true, data: result });
}

export async function adminLogin(req: Request, res: Response) {
  const result = await authService.adminLogin(req.body, meta(req));
  res.status(200).json({ success: true, data: result });
}

export async function refresh(req: Request, res: Response) {
  const result = await authService.refreshAccessToken(req.body.refreshToken, meta(req));
  res.status(200).json({ success: true, data: result });
}

export async function logout(req: Request, res: Response) {
  await authService.logout(req.body.refreshToken);
  res.status(200).json({ success: true, data: { loggedOut: true } });
}

export async function logoutAll(req: Request, res: Response) {
  if (!req.user) throw Errors.unauthenticated();
  await authService.logoutAll(req.user.sub);
  res.status(200).json({ success: true, data: { loggedOut: true } });
}

export async function me(req: Request, res: Response) {
  if (!req.user) throw Errors.unauthenticated();
  const user = await authService.getMe(req.user.sub);
  res.status(200).json({ success: true, data: user });
}

export async function updateProfile(req: Request, res: Response) {
  if (!req.user) throw Errors.unauthenticated();
  const user = await authService.updateProfile(req.user.sub, req.body);
  res.status(200).json({ success: true, data: user });
}

export async function changePassword(req: Request, res: Response) {
  if (!req.user) throw Errors.unauthenticated();
  await authService.changePassword(req.user.sub, req.body);
  res.status(200).json({ success: true, data: { changed: true } });
}

export async function listSessions(req: Request, res: Response) {
  if (!req.user) throw Errors.unauthenticated();
  const sessions = await authService.listSessions(req.user.sub, req.body.refreshToken);
  res.status(200).json({ success: true, data: sessions });
}

export async function revokeSession(req: Request, res: Response) {
  if (!req.user) throw Errors.unauthenticated();
  await authService.revokeSession(req.user.sub, req.params.sessionId as string);
  res.status(200).json({ success: true, data: { revoked: true } });
}

export async function verifyEmail(req: Request, res: Response) {
  await authService.verifyEmail(req.body.token);
  res.status(200).json({ success: true, data: { verified: true } });
}

export async function resendVerification(req: Request, res: Response) {
  await authService.resendVerification(req.body.email);
  res.status(200).json({ success: true, data: { sent: true } });
}

export async function forgotPassword(req: Request, res: Response) {
  await authService.forgotPassword(req.body);
  res.status(200).json({ success: true, data: { sent: true } });
}

export async function resetPassword(req: Request, res: Response) {
  await authService.resetPassword(req.body);
  res.status(200).json({ success: true, data: { reset: true } });
}

export async function oauthUpsert(req: Request, res: Response) {
  const result = await authService.oauthUpsert(req.body, meta(req));
  res.status(200).json({ success: true, data: result });
}
