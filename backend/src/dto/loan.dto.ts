import { z } from "zod";

export const fundLoanRequestSchema = z
  .object({
    amount: z.number().positive("amount must be a positive number."),
  })
  .strict();

export type FundLoanRequestDto = z.infer<typeof fundLoanRequestSchema>;
