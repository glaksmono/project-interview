import { Router, Request, Response } from "express";
import * as AuthService from "../services/AuthService";

const router = Router();

router.post("/register", async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "name, email, password, and role are required.",
    });
    return;
  }

  const result = await AuthService.register({ name, email, password, role });
  res.status(201).json(result);
});

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "email and password are required.",
    });
    return;
  }

  const result = await AuthService.login(email, password);
  res.json(result);
});

export default router;
