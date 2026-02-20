import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    jobTitle: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    location: {
      type: String,
      trim: true,
    },

    jobLink: {
      type: String,
      trim: true,
    },

    salaryRange: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: "USD",
      },
    },

    status: {
      type: String,
      enum: ["APPLIED", "INTERVIEW", "OFFER", "REJECTED", "WITHDRAWN"],
      default: "APPLIED",
      index: true,
    },

    appliedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    interviews: [
      {
        round: String,
        scheduledAt: Date,
        type: {
          type: String,
          enum: ["HR", "TECHNICAL", "MANAGERIAL", "OTHER"],
        },
        notes: String,
      },
    ],

    rejectionReason: {
      type: String,
      trim: true,
    },

    offerDetails: {
      salary: Number,
      joiningDate: Date,
      notes: String,
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

applicationSchema.index({ user: 1, status: 1 });
applicationSchema.index({ user: 1, createdAt: -1 });

export const Application = mongoose.model("Application", applicationSchema);
