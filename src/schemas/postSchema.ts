import Joi from "joi";

export const postSchema = Joi.object({
  description: Joi.string().trim().min(1).max(1000).required().messages({
    "string.empty": "Description is required",
    "string.min": "Description must be at least 1 character",
    "string.max": "Description cannot exceed 1000 characters",
    "any.required": "Description is required",
  }),

  scheduledTime: Joi.date().greater("now").required().messages({
    "date.base": "Please select a valid date and time",
    "date.greater": "Please select a future date and time",
    "any.required": "Please select a date and time",
  }),
});

export type PostFormData = {
  description: string;
  scheduledTime: string;
};
