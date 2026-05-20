import { z } from "zod";

export const createOrderRequestSchema = z
  .object({
    product_id: z.string().uuid("product_id must be a valid UUID."),
    quantity: z.number().int().min(1, "quantity must be a positive integer."),
    payment_method: z.enum(["direct", "loan"], {
      required_error: "payment_method is required.",
      invalid_type_error: 'payment_method must be "direct" or "loan".',
    }),
    loan_term_months: z.number().int().min(1).max(12).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.payment_method === "loan" && data.loan_term_months === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["loan_term_months"],
        message: "loan_term_months is required when payment_method is loan.",
      });
    }

    if (
      data.payment_method === "direct" &&
      data.loan_term_months !== undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["loan_term_months"],
        message:
          "loan_term_months must not be provided when payment_method is direct.",
      });
    }
  });

export type CreateOrderRequestDto = z.infer<typeof createOrderRequestSchema>;
