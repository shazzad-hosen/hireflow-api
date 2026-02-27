import express from "express";
import validate from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  registerUserController,
  loginUserController,
  refreshUserTokenController,
  logoutUserController,
  getSessionsController,
  revokeSessionController,
} from "../controllers/auth.controller.js";

import verifyRefreshToken from "../middlewares/verifyRefreshToken.middleware.js";
import protect from "../middlewares/protect.middleware.js";

import {
  registerLimiter,
  loginLimiter,
  refreshLimiter,
} from "../middlewares/rateLimiter.js";

const router = express.Router();

router.post(
  "/register",
  registerLimiter,
  validate(registerSchema),
  asyncHandler(registerUserController),
);

router.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  asyncHandler(loginUserController),
);

router.post(
  "/refresh",
  refreshLimiter,
  verifyRefreshToken,
  asyncHandler(refreshUserTokenController),
);

router.post("/logout", protect, asyncHandler(logoutUserController));

router.get("/sessions", protect, getSessionsController);

router.delete("/sessions/:id", protect, revokeSessionController);

export default router;
