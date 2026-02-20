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
      min: {
        type: Number,
        min: 0,
      },
      max: {
        type: Number,
        min: 0,
        validate: {
          validator: function (value) {
            return !this.salaryRange.min || value >= this.salaryRange.min;
          },
          message: "Max salary must be greater than or equal to min salary",
        },
      },
      currency: {
        type: String,
        uppercase: true,
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
        round: {
          type: String,
          trim: true,
        },
        scheduledAt: Date,
        type: {
          type: String,
          enum: ["HR", "TECHNICAL", "MANAGERIAL", "OTHER"],
        },
        notes: {
          type: String,
          trim: true,
        },
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
    
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);

// Prevent impossible data combinations
applicationSchema.pre("save", function (next) {
  if (this.status === "REJECTED" && this.offerDetails) {
    return next(new Error("Rejected application cannot contain offer details"));
  }

  if (
    this.status === "OFFER" &&
    (!this.offerDetails || this.offerDetails.salary)
  ) {
    return next(new Error("Offer details required when status is OFFER"));
  }

  next();
});

// Filter deleted applications in every find
applicationSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

applicationSchema.index({ user: 1, status: 1 });
applicationSchema.index({ user: 1, createdAt: -1 });
applicationSchema.index({ user: 1, companyName: 1 });
applicationSchema.index({ user: 1, appliedAt: -1 });

export const Application = mongoose.model("Application", applicationSchema);
