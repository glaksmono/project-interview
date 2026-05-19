import { Router, Response } from "express";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";
import * as LoanService from "../services/LoanService";
import { FundLoanRequestDto, fundLoanRequestSchema } from "../dto/loan.dto";
import { validateBody } from "../middleware/validateBody";

const router = Router();

// GET /loans
router.get(
  "/",
  authenticate,
  requireRole("lender"),
  async (_req: AuthRequest, res: Response): Promise<void> => {
    const data = await LoanService.listOpenLoans();
    res.json({ data });
  },
);

// GET /loans/history
router.get(
  "/history",
  authenticate,
  requireRole("lender"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const data = await LoanService.listFundingHistory(req.user!.id);
    res.json({ data });
  },
);

// GET /loans/:id
router.get(
  "/:id",
  authenticate,
  requireRole("lender"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const result = await LoanService.getLoanById(req.params.id);
    res.json(result);
  },
);

// POST /loans/:id/fund
router.post(
  "/:id/fund",
  authenticate,
  requireRole("lender"),
  validateBody(fundLoanRequestSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { amount } = req.body as FundLoanRequestDto;

    const result = await LoanService.fundLoan(
      req.params.id,
      req.user!.id,
      amount,
    );
    res.json(result);
  },
);

export default router;
