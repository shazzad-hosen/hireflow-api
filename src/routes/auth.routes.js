import express from "express";
import validate from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  register,
  login,
  refreshToken,
  logout,
} from "../controllers/auth.controller.js";

import verifyRefreshToken from "../middlewares/verifyRefreshToken.middleware.js";

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
  asyncHandler(register),
);

router.post("/login", loginLimiter, validate(loginSchema), asyncHandler(login));

router.post(
  "/refresh",
  refreshLimiter,
  verifyRefreshToken,
  asyncHandler(refreshToken),
);

router.post("/logout", verifyRefreshToken, asyncHandler(logout));

export default router;
