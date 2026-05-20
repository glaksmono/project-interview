import { z } from "zod";

export const registerRequestSchema = z
  .object({
    name: z.string().trim().min(1, "name is required."),
    email: z.string().trim().email("email must be a valid email address."),
    password: z.string().min(6, "password must be at least 6 characters."),
    role: z.enum(["buyer", "lender"], {
      message: 'role must be "buyer" or "lender".',
    }),
  })
  .strict();

export const loginRequestSchema = z
  .object({
    email: z.string().trim().email("email must be a valid email address."),
    password: z.string().min(1, "password is required."),
  })
  .strict();

export type RegisterRequestDto = z.infer<typeof registerRequestSchema>;
export type LoginRequestDto = z.infer<typeof loginRequestSchema>;
