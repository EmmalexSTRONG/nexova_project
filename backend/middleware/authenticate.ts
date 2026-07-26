import type { NextFunction, Request, Response } from "express";
import type { JwtAccessPayload } from "../types";
import { verifyAccessToken } from "../utils/jwt";
import { Errors } from "../utils/app-error";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtAccessPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return next(Errors.unauthenticated());
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(Errors.unauthenticated());
  }
}

export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (token) {
    try {
      req.user = verifyAccessToken(token);
    } catch {
      // Ignore invalid tokens on optional auth routes.
    }
  }

  next();
}
