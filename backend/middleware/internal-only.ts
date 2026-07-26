import type { NextFunction, Request, Response } from "express";
import { env } from "../utils/env";
import { Errors } from "../utils/app-error";

// Guards endpoints that must only ever be called server-to-server (e.g. by
// the Next.js server after it completes an OAuth handshake), never by a
// browser directly.
export function internalOnly(req: Request, _res: Response, next: NextFunction) {
  const secret = req.headers["x-internal-secret"];
  if (secret !== env.INTERNAL_API_SECRET) {
    return next(Errors.unauthenticated());
  }
  next();
}
