import Joi from "joi";

// Schema validation for create application
export const createApplicationSchema = Joi.object({
  companyName: Joi.string().trim().min(2).max(100).required(),

  jobTitle: Joi.string().trim().min(2).max(100).required(),

  location: Joi.string().trim().max(100).optional(),

  jobLink: Joi.string().uri().optional(),

  salaryRange: Joi.object({
    min: Joi.number().min(0).optional(),
    max: Joi.number().min(0).optional(),
    currency: Joi.string().length(3).optional(),
  }).optional(),

  status: Joi.string()
    .valid("APPLIED", "INTERVIEW", "OFFER", "REJECTED", "WITHDRAWN")
    .optional(),

  appliedAt: Joi.date().optional(),

  interviews: Joi.array().items(
    Joi.object({
      round: Joi.string().trim().optional(),
      scheduledAt: Joi.date().optional(),
      type: Joi.string()
        .valid("HR", "TECHNICAL", "MANAGERIAL", "OTHER")
        .optional(),
      notes: Joi.string().trim().optional(),
    }),
  ),

  rejectionReason: Joi.string().trim().optional(),

  offerDetails: Joi.object({
    salary: Joi.number().optional(),
    joiningDate: Joi.date().optional(),
    notes: Joi.string().optional(),
  }).optional(),

  notes: Joi.string().trim().optional(),
});
