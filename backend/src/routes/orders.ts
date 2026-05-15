import { Router, Response } from "express";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";
import * as OrderService from "../services/OrderService";

const router = Router();

// POST /orders
router.post(
  "/",
  authenticate,
  requireRole("buyer"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { product_id, quantity, payment_method, loan_term_months } = req.body;

    if (!product_id || !quantity || !payment_method) {
      res
        .status(400)
        .json({
          error: "VALIDATION_ERROR",
          message: "product_id, quantity, and payment_method are required.",
        });
      return;
    }
    if (
      typeof quantity !== "number" ||
      quantity < 1 ||
      !Number.isInteger(quantity)
    ) {
      res
        .status(400)
        .json({
          error: "VALIDATION_ERROR",
          message: "quantity must be a positive integer.",
        });
      return;
    }
    if (!["direct", "loan"].includes(payment_method)) {
      res
        .status(400)
        .json({
          error: "VALIDATION_ERROR",
          message: 'payment_method must be "direct" or "loan".',
        });
      return;
    }
    if (
      payment_method === "loan" &&
      (!loan_term_months ||
        typeof loan_term_months !== "number" ||
        loan_term_months < 1 ||
        loan_term_months > 12 ||
        !Number.isInteger(loan_term_months))
    ) {
      res
        .status(400)
        .json({
          error: "VALIDATION_ERROR",
          message: "loan_term_months must be an integer between 1 and 12.",
        });
      return;
    }

    const result = await OrderService.createOrder({
      buyerId: req.user!.id,
      productId: product_id,
      quantity,
      paymentMethod: payment_method,
      loanTermMonths: loan_term_months,
    });
    res.status(201).json(result);
  },
);

// GET /orders
router.get(
  "/",
  authenticate,
  requireRole("buyer"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const data = await OrderService.listOrders(req.user!.id);
    res.json({ data });
  },
);

// GET /orders/:id
router.get(
  "/:id",
  authenticate,
  requireRole("buyer"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const result = await OrderService.getOrderById(req.params.id, req.user!.id);
    res.json(result);
  },
);

export default router;
