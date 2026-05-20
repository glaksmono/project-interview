import { Router, Response } from "express";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";
import * as OrderService from "../services/OrderService";
import {
  CreateOrderRequestDto,
  createOrderRequestSchema,
} from "../dto/order.dto";
import { validateBody } from "../middleware/validateBody";

const router = Router();

// POST /orders
router.post(
  "/",
  authenticate,
  requireRole("buyer"),
  validateBody(createOrderRequestSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { product_id, quantity, payment_method, loan_term_months } =
      req.body as CreateOrderRequestDto;

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
