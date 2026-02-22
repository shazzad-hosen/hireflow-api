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
  getAnalyticsController,
} from "../controllers/application.controller.js";
import {
  createApplicationSchema,
  updateApplicationSchema,
} from "../validations/application.validation.js";

const router = express.Router();

router.get("/analytics", protect, asyncHandler(getAnalyticsController));

router.post(
  "/",
  protect,
  validate(createApplicationSchema),
  asyncHandler(createApplicationController),
);

router.get("/", protect, asyncHandler(getApplicationsController));

router.get("/:id", protect, asyncHandler(getSingleApplicationController));

router.patch(
  "/:id",
  protect,
  validate(updateApplicationSchema),
  asyncHandler(updateApplicationController),
);

router.delete("/:id", protect, asyncHandler(deleteApplicationController));

export default router;
