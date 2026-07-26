import { Router } from "express";
import * as chatController from "../../controllers/chat.controller";
import { asyncHandler } from "../../middleware/async-handler";
import { validate } from "../../middleware/validate";
import { chatRateLimiter } from "../../middleware/rate-limiter";
import { internalOnly } from "../../middleware/internal-only";

const router = Router();

// internalOnly (not `authenticate`) so anonymous shoppers can still use the
// chatbot without logging in — the trust boundary is "request came from our
// own Next.js server," not "request came from a signed-in user."
router.post(
  "/completions",
  internalOnly,
  chatRateLimiter,
  validate(chatController.chatCompletionSchema),
  asyncHandler(chatController.chatCompletion),
);

export default router;
