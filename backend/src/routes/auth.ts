import { Router, Request, Response } from "express";
import * as AuthService from "../services/AuthService";
import {
  LoginRequestDto,
  RegisterRequestDto,
  loginRequestSchema,
  registerRequestSchema,
} from "../dto/auth.dto";
import { validateBody } from "../middleware/validateBody";

const router = Router();

router.post(
  "/register",
  validateBody(registerRequestSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, role } = req.body as RegisterRequestDto;

    const result = await AuthService.register({ name, email, password, role });
    res.status(201).json(result);
  },
);

router.post(
  "/login",
  validateBody(loginRequestSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as LoginRequestDto;

    const result = await AuthService.login(email, password);
    res.json(result);
  },
);

export default router;
