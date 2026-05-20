import { Request, Response, NextFunction } from "express";
import { ServiceError } from "../services/ServiceError";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ServiceError) {
    res.status(err.statusCode).json({
      error: err.errorCode,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  console.error("[Unhandled Error]", err);
  res.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred.",
  });
};
