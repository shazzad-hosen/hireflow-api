import express from "express";
import protect from "../middlewares/protect.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createApplicationController,
  getApplicationsController,
  getSingleApplicationController,
  updateApplicationController,
  deleteApplicationController,
  getApplicationAnalyticsController,
  getApplicationHistoryController,
} from "../controllers/application.controller.js";

import {
  createApplicationSchema,
  updateApplicationSchema,
} from "../validations/application.validation.js";

import { apiLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.get(
  "/analytics",
  protect,
  apiLimiter,
  asyncHandler(getApplicationAnalyticsController),
);

router.post(
  "/",
  protect,
  apiLimiter,
  validate(createApplicationSchema),
  asyncHandler(createApplicationController),
);

router.get("/", apiLimiter, protect, asyncHandler(getApplicationsController));

router.get(
  "/:id",
  protect,
  apiLimiter,
  asyncHandler(getSingleApplicationController),
);

router.patch(
  "/:id",
  protect,
  apiLimiter,
  validate(updateApplicationSchema),
  asyncHandler(updateApplicationController),
);

router.delete("/:id", protect, asyncHandler(deleteApplicationController));

router.get(
  "/:id/history",
  protect,
  apiLimiter,
  asyncHandler(getApplicationHistoryController),
);

export default router;
