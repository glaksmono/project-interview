import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ error: "UNAUTHORIZED", message: "Missing or invalid token." });
    return;
  }

  const token = auth.slice(7);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Server configuration error.",
    });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as {
      id: string;
      role: string;
    };
    req.user = payload;
    next();
  } catch {
    res
      .status(401)
      .json({ error: "UNAUTHORIZED", message: "Missing or invalid token." });
  }
};

export const requireRole =
  (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        error: "FORBIDDEN",
        message: "You do not have permission to perform this action.",
      });
      return;
    }
    next();
  };
