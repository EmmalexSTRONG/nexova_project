import express, { type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import { env } from "./utils/env";
import authRoutes from "./routes/auth";
import orderRoutes from "./routes/orders";
import paymentRoutes from "./routes/payments";
import bookingRoutes from "./routes/bookings";
import chatRoutes from "./routes/chat";
import notificationRoutes from "./routes/notifications";
import uploadRoutes from "./routes/uploads";
import vendorApplicationRoutes from "./routes/vendor-applications";
import { errorHandler } from "./middleware/error-handler";

const app: Application = express();

// Required for express-rate-limit to key on the real client IP rather than
// a reverse proxy's address once this is deployed behind one — without this,
// every rate limiter (login, chat, payment-init, notification dispatch)
// silently collapses into one shared bucket across all users. Adjust the hop
// count if the real deployment topology differs from a single proxy.
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(compression());
app.use(morgan("dev"));
app.use(cookieParser());
// Captures the raw request body alongside the parsed one — payment webhook
// signatures (Paystack's HMAC) are computed over the exact raw bytes, which
// are otherwise lost once express.json() parses them.
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as express.Request & { rawBody: Buffer }).rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/uploads", uploadRoutes);
app.use("/api/v1/vendor-applications", vendorApplicationRoutes);
// Further feature routes are mounted here as they are implemented, e.g.:
// app.use("/api/v1/products", productRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Route not found" } });
});

app.use(errorHandler);

export default app;
