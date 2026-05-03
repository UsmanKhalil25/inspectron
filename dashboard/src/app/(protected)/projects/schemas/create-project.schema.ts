import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Project name is required")
    .max(100, "Project name must be less than 100 characters"),

  url: z
    .string()
    .trim()
    .url("Please enter a valid URL")
    .min(1, "URL is required"),

  description: z
    .string()
    .trim()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

export type CreateProjectFormData = z.infer<typeof createProjectSchema>;
