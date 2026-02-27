import express from "express";
import validate from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  registerController,
  loginController,
  refreshTokenController,
  logoutController,
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
  asyncHandler(registerController),
);

router.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  asyncHandler(loginController),
);

router.post(
  "/refresh",
  refreshLimiter,
  verifyRefreshToken,
  asyncHandler(refreshTokenController),
);

router.post("/logout", protect, asyncHandler(logoutController));

export default router;
