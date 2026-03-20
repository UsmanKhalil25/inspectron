import * as z from "zod";

export const LoginState = z.object({
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

export type LoginStateType = z.infer<typeof LoginState>;
