import { NextFunction, Request, RequestHandler, Response } from "express";
import { z } from "zod";
import { ServiceError } from "../services/ServiceError";

export function validateBody(schema: z.ZodTypeAny): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new ServiceError(400, "VALIDATION_ERROR", "Invalid request body.", {
        fields: result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    req.body = result.data;
    next();
  };
}
