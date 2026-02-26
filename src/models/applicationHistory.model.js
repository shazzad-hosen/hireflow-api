import mongoose from "mongoose";

const applicationHistorySchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    previousStatus: {
      type: String,
      required: true,
    },
    newStatus: {
      type: String,
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

applicationHistorySchema.index({ application: 1, createdAt: 1 });

export const ApplicationHistory = mongoose.model(
  "ApplicationHistory",
  applicationHistorySchema,
);
