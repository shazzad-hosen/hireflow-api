import Joi from "joi";

// Schema Validation For Register
export const registerSchema = Joi.object({
  name: Joi.string().trim().min(3).max(25).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 3 characters",
    "string.max": "Name cannot exceed 25 characters",
  }),

  email: Joi.string().trim().email().required().messages({
    "string.email": "Invalid email format",
    "string.empty": "Email is required",
  }),

  password: Joi.string().min(6).max(30).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.empty": "Password is required",
  }),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

// Schema Validation For Login
export const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    "string.email": "Invalid email format",
    "string.empty": "Email is required",
  }),

  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
}).options({
  abortEarly: false,
  allowUnknown: false,
});
