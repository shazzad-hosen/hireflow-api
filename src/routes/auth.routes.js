import express from "express";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";
import validate from "../middlewares/validate.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import { register, login } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", validate(registerSchema), asyncHandler(register));
router.post("/login", validate(loginSchema), asyncHandler(login));

export default router;
