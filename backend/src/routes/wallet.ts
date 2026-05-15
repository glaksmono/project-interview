import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import * as WalletService from "../services/WalletService";

const router = Router();

router.get(
  "/",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const result = await WalletService.getBalance(req.user!.id);
    res.json(result);
  },
);

export default router;
