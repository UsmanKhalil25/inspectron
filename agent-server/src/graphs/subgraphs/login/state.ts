import { z } from "zod";
import { Annotation } from "@langchain/langgraph";

// Schema is the single source of truth (SSOT)
export const LoginGraphSchema = z.object({
  img: z.string().optional(),
  loginRequired: z.boolean().optional(),
  loginUrl: z.string().optional(),
  credentials: z
    .object({
      username: z.string(),
      password: z.string(),
    })
    .optional(),
  loginCompleted: z.boolean().optional(),
});

// Type is derived from schema
export type LoginGraphStateType = z.infer<typeof LoginGraphSchema>;

// Annotation uses the same shape as the schema
export const LoginGraphState = Annotation.Root({
  img: Annotation<string | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  loginRequired: Annotation<boolean | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  loginUrl: Annotation<string | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  credentials: Annotation<
    | {
        username: string;
        password: string;
      }
    | undefined
  >({
    value: (_, y) => y,
    default: () => undefined,
  }),
  loginCompleted: Annotation<boolean | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
});
