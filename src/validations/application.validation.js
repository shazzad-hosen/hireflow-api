import Joi from "joi";

export const createApplicationSchema = Joi.object({
  companyName: Joi.string().trim().min(2).max(100).required(),

  jobTitle: Joi.string().trim().min(2).max(100).required(),

  location: Joi.string().trim().max(100).optional(),

  jobLink: Joi.string().uri().optional(),

  salaryRange: Joi.object({
    min: Joi.number().min(0),
    max: Joi.number().min(Joi.ref("min")),
    currency: Joi.string().length(3).uppercase().optional(),
  }).optional(),

  status: Joi.string()
    .valid("APPLIED", "INTERVIEW", "OFFER", "REJECTED", "WITHDRAWN")
    .default("APPLIED"),

  appliedAt: Joi.date().optional(),

  interviews: Joi.array()
    .items(
      Joi.object({
        round: Joi.string().trim().optional(),
        scheduledAt: Joi.date().optional(),
        type: Joi.string()
          .valid("HR", "TECHNICAL", "MANAGERIAL", "OTHER")
          .optional(),
        notes: Joi.string().trim().max(2000).optional(),
      }),
    )
    .optional(),

  rejectionReason: Joi.string().trim().max(1000).when("status", {
    is: "REJECTED",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),

  offerDetails: Joi.object({
    salary: Joi.number().optional(),

    joiningDate: Joi.date().optional(),

    notes: Joi.string().max(2000).optional(),
  }).when("status", {
    is: "OFFER",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),

  notes: Joi.string().trim().max(3000).optional(),
});

export const updateApplicationSchema = createApplicationSchema
  .fork(Object.keys(createApplicationSchema.describe().keys), (schema) =>
    schema.optional(),
  )
  .min(1);
