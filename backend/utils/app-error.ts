export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const Errors = {
  invalidCredentials: () => new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password"),
  incorrectPassword: () => new AppError(401, "INCORRECT_PASSWORD", "Current password is incorrect"),
  emailInUse: () => new AppError(409, "EMAIL_IN_USE", "An account with this email already exists"),
  accountBanned: () => new AppError(403, "ACCOUNT_BANNED", "This account has been banned"),
  accountSuspended: () => new AppError(403, "ACCOUNT_SUSPENDED", "This account has been suspended"),
  notAdmin: () => new AppError(403, "NOT_AUTHORIZED", "This account does not have admin access"),
  invalidToken: (what = "token") => new AppError(400, "INVALID_TOKEN", `Invalid or expired ${what}`),
  unauthenticated: () => new AppError(401, "UNAUTHENTICATED", "Authentication required"),
  forbidden: () => new AppError(403, "FORBIDDEN", "You do not have permission to perform this action"),
  notFound: (what = "Resource") => new AppError(404, "NOT_FOUND", `${what} not found`),
};
