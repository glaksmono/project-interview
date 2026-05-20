import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import * as ProductService from "../services/ProductService";

const router = Router();

router.get(
  "/",
  authenticate,
  async (_req: AuthRequest, res: Response): Promise<void> => {
    const data = await ProductService.listProducts();
    res.json({ data });
  },
);

export default router;
