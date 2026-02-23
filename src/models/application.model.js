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
            if (this.salaryRange?.min == null) return true;
            return value >= this.salaryRange.min;
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
      salary: {
        type: Number,
        min: 0,
      },
      currency: {
        type: String,
        uppercase: true,
        default: "USD",
      },
      joiningDate: Date,
      notes: {
        type: String,
        trim: true,
      },
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

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

applicationSchema.pre("save", function () {
  if (this.status === "REJECTED") {
    this.isActive = false;
  }

  if (this.status !== "REJECTED") {
    this.isActive = true;
  }

  if (this.status !== "OFFER") {
    this.offerDetails = undefined;
  }

  if (this.status === "REJECTED" && this.offerDetails) {
    throw new Error("Rejected application cannot contain offer details");
  }

  if (
    this.status === "OFFER" &&
    (!this.offerDetails || !this.offerDetails.salary)
  ) {
    throw new Error("Offer details required when status is OFFER");
  }

  if (this.salaryRange?.max < this.salaryRange?.min) {
    throw new Error("Max salary must be greater than or equal to min salary");
  }
});

applicationSchema.pre(/^find/, function () {
  this.where({ isDeleted: { $ne: true } });
});

applicationSchema.pre(/^findOneAndUpdate/, function () {
  this.where({ isDeleted: { $ne: true } });
});

applicationSchema.pre("aggregate", function () {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
});

applicationSchema.index({ user: 1, status: 1 });
applicationSchema.index({ user: 1, createdAt: -1 });
applicationSchema.index({ user: 1, appliedAt: -1 });

applicationSchema.index(
  { user: 1, companyName: 1, jobTitle: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true },
  },
);

export const Application = mongoose.model("Application", applicationSchema);
