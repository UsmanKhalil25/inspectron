import * as z from "zod";
import type { Page } from "playwright";
import {
  PageElement,
  PageElementSchema,
} from "../../../libs/schemas/page-elements";

export const InputFieldTypeSchema = z.enum([
  "text",
  "email",
  "password",
  "tel",
  "number",
  "url",
  "search",
  "textarea",
]);

export const InputFieldSchema = z.object({
  id: z.number().describe("Element ID from interactive elements"),
  label: z.string().describe("Human-readable label for the field"),
  type: InputFieldTypeSchema.optional(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
});

export const InputRequestSchema = z.object({
  fields: z.array(InputFieldSchema).describe("Fields that need user input"),
  prompt: z.string().describe("What input is needed and why"),
  context: z.string().optional().describe("Additional context for the user"),
});

export type InputField = z.infer<typeof InputFieldSchema>;
export type InputRequest = z.infer<typeof InputRequestSchema>;

export interface InputHandlerStateType {
  page?: Page;
  interactiveElements?: PageElement[];
  img?: string;
  inputRequest?: InputRequest;
  inputValues?: Record<string, string>;
  inputCompleted?: boolean;
}
