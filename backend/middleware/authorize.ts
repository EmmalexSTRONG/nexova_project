import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "../types";
import { Errors } from "../utils/app-error";

// NOT CURRENTLY WIRED INTO ANY ROUTE. Role-gating today lives entirely in
// the Next.js edge middleware (frontend/middleware.ts), which protects
// *page* access but does nothing if an API route is called directly. That's
// safe only because no mounted route in backend actually needs admin/vendor
// role restriction yet. The moment one does, apply `authorize(...)` to it —
// don't assume the web middleware alone is sufficient protection.
export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(Errors.unauthenticated());
    }
    if (!roles.includes(req.user.role)) {
      return next(Errors.forbidden());
    }
    next();
  };
}
