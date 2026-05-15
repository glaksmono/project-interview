import { AppDataSource } from "../config/database";
import { LoanApplication } from "../entities/LoanApplication";
import { LoanFunding } from "../entities/LoanFunding";
import { Order } from "../entities/Order";
import { Product } from "../entities/Product";
import { User } from "../entities/User";
import { RepaymentInstallment } from "../entities/RepaymentInstallment";
import { ServiceError } from "./ServiceError";

function monthlyInstallment(loan: LoanApplication): number {
  return Math.round(
    (loan.requestedAmount * (1 + loan.interestRate)) / loan.termMonths,
  );
}

// ─── listOpenLoans ────────────────────────────────────────────────────────────

export async function listOpenLoans() {
  const loans = await AppDataSource.getRepository(LoanApplication).find({
    where: { status: "open" },
    relations: ["buyer"],
    order: { createdAt: "DESC" },
  });

  return loans.map((loan) => ({
    id: loan.id,
    borrower: { id: loan.buyer.id, name: loan.buyer.name },
    orderId: loan.orderId,
    requestedAmount: loan.requestedAmount,
    fundedAmount: loan.fundedAmount,
    remainingAmount: loan.requestedAmount - loan.fundedAmount,
    termMonths: loan.termMonths,
    interestRate: loan.interestRate,
    monthlyInstallment: monthlyInstallment(loan),
    status: loan.status,
    createdAt: loan.createdAt,
  }));
}

// ─── listFundingHistory ─────────────────────────────────────────────────────

export interface LenderFundingHistoryItem {
  id: string;
  amount: number;
  fundedAt: Date;
  estimatedReturnAmount: number;
  estimatedProfit: number;
  borrower: {
    id: string;
    name: string;
  } | null;
  loan: {
    id: string;
    status: string;
    requestedAmount: number;
    fundedAmount: number;
    remainingAmount: number;
    termMonths: number;
    interestRate: number;
  };
  order: {
    id: string;
    status: string;
    paymentMethod: string;
    quantity: number;
    totalAmount: number;
    createdAt: Date;
  } | null;
  product: {
    id: string;
    name: string;
    category: string;
    price: number;
  } | null;
}

export async function listFundingHistory(
  lenderId: string,
): Promise<LenderFundingHistoryItem[]> {
  const fundings = await AppDataSource.getRepository(LoanFunding).find({
    where: { lenderId },
    relations: [
      "loanApplication",
      "loanApplication.buyer",
      "loanApplication.order",
      "loanApplication.order.product",
    ],
    order: { fundedAt: "DESC" },
  });

  return fundings.map((funding) => {
    const loan = funding.loanApplication;
    const order = loan?.order ?? null;
    const product = order?.product ?? null;
    const borrower = loan?.buyer ?? null;

    const estimatedProfit = Math.round(funding.amount * loan.interestRate);
    const estimatedReturnAmount = funding.amount + estimatedProfit;

    return {
      id: funding.id,
      amount: funding.amount,
      fundedAt: funding.fundedAt,
      estimatedReturnAmount,
      estimatedProfit,
      borrower: borrower
        ? {
            id: borrower.id,
            name: borrower.name,
          }
        : null,
      loan: {
        id: loan.id,
        status: loan.status,
        requestedAmount: loan.requestedAmount,
        fundedAmount: loan.fundedAmount,
        remainingAmount: loan.requestedAmount - loan.fundedAmount,
        termMonths: loan.termMonths,
        interestRate: loan.interestRate,
      },
      order: order
        ? {
            id: order.id,
            status: order.status,
            paymentMethod: order.paymentMethod,
            quantity: order.quantity,
            totalAmount: order.totalAmount,
            createdAt: order.createdAt,
          }
        : null,
      product: product
        ? {
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
          }
        : null,
    };
  });
}

// ─── getLoanById ──────────────────────────────────────────────────────────────

export async function getLoanById(loanId: string) {
  const loan = await AppDataSource.getRepository(LoanApplication).findOne({
    where: { id: loanId },
    relations: ["buyer", "fundings", "fundings.lender"],
  });

  if (!loan) {
    throw new ServiceError(404, "NOT_FOUND", "Loan application not found.");
  }

  return {
    id: loan.id,
    borrower: { id: loan.buyer.id, name: loan.buyer.name },
    orderId: loan.orderId,
    requestedAmount: loan.requestedAmount,
    fundedAmount: loan.fundedAmount,
    remainingAmount: loan.requestedAmount - loan.fundedAmount,
    termMonths: loan.termMonths,
    interestRate: loan.interestRate,
    monthlyInstallment: monthlyInstallment(loan),
    status: loan.status,
    fundings: (loan.fundings ?? []).map((f) => ({
      id: f.id,
      lender: { id: f.lender.id, name: f.lender.name },
      amount: f.amount,
      fundedAt: f.fundedAt,
    })),
    createdAt: loan.createdAt,
  };
}

// ─── fundLoan ─────────────────────────────────────────────────────────────────

export interface FundLoanResult {
  funding: {
    id: string;
    loanApplicationId: string;
    amount: number;
    fundedAt: Date;
  };
  loanApplication: {
    id: string;
    fundedAmount: number;
    remainingAmount: number;
    status: string;
  };
  walletBalanceAfter: number;
}

export async function fundLoan(
  loanId: string,
  lenderId: string,
  amount: number,
): Promise<FundLoanResult> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const loan = await queryRunner.manager
      .createQueryBuilder(LoanApplication, "loan")
      .where("loan.id = :id", { id: loanId })
      .setLock("pessimistic_write")
      .getOne();

    if (!loan) {
      throw new ServiceError(404, "NOT_FOUND", "Loan application not found.");
    }

    if (loan.status !== "open") {
      throw new ServiceError(
        422,
        "LOAN_NOT_OPEN",
        "This loan is no longer open for funding.",
      );
    }

    const remaining = loan.requestedAmount - loan.fundedAmount;
    if (amount > remaining) {
      throw new ServiceError(
        422,
        "OVER_FUNDING",
        "Funding amount exceeds the remaining unfunded amount.",
        { remaining, requested: amount },
      );
    }

    const lender = await queryRunner.manager
      .createQueryBuilder(User, "u")
      .where("u.id = :id", { id: lenderId })
      .setLock("pessimistic_write")
      .getOne();

    if (!lender) {
      throw new ServiceError(404, "NOT_FOUND", "User not found.");
    }

    if (lender.walletBalance < amount) {
      throw new ServiceError(
        422,
        "INSUFFICIENT_WALLET_BALANCE",
        "Your wallet balance is insufficient to fund this amount.",
        { required: amount, available: lender.walletBalance },
      );
    }

    // Deduct lender wallet
    lender.walletBalance -= amount;
    await queryRunner.manager.save(lender);

    // Record funding contribution
    const fundedAt = new Date();
    const funding = queryRunner.manager.create(LoanFunding, {
      loanApplicationId: loan.id,
      lenderId: lender.id,
      amount,
      fundedAt,
    });
    await queryRunner.manager.save(funding);

    // Update loan funded amount
    loan.fundedAmount += amount;

    // Check if fully funded
    if (loan.fundedAmount >= loan.requestedAmount) {
      loan.status = "funded";

      const order = await queryRunner.manager.findOne(Order, {
        where: { id: loan.orderId },
      });
      if (order) {
        order.status = "confirmed";
        await queryRunner.manager.save(order);

        const product = await queryRunner.manager
          .createQueryBuilder(Product, "p")
          .where("p.id = :id", { id: order.productId })
          .setLock("pessimistic_write")
          .getOne();

        if (product) {
          product.stockQuantity -= order.quantity;
          await queryRunner.manager.save(product);
        }
      }

      // Generate repayment schedule
      const installmentAmount = Math.round(
        (loan.requestedAmount * (1 + loan.interestRate)) / loan.termMonths,
      );
      const installments: RepaymentInstallment[] = [];
      for (let i = 1; i <= loan.termMonths; i++) {
        const dueDate = new Date(fundedAt);
        dueDate.setDate(dueDate.getDate() + 30 * i);
        const yyyy = dueDate.getFullYear();
        const mm = String(dueDate.getMonth() + 1).padStart(2, "0");
        const dd = String(dueDate.getDate()).padStart(2, "0");
        installments.push(
          queryRunner.manager.create(RepaymentInstallment, {
            loanApplicationId: loan.id,
            installmentNumber: i,
            amount: installmentAmount,
            dueDate: `${yyyy}-${mm}-${dd}`,
            status: "pending",
          }),
        );
      }
      await queryRunner.manager.save(installments);
    }

    await queryRunner.manager.save(loan);
    await queryRunner.commitTransaction();

    return {
      funding: {
        id: funding.id,
        loanApplicationId: funding.loanApplicationId,
        amount: funding.amount,
        fundedAt: funding.fundedAt,
      },
      loanApplication: {
        id: loan.id,
        fundedAmount: loan.fundedAmount,
        remainingAmount: loan.requestedAmount - loan.fundedAmount,
        status: loan.status,
      },
      walletBalanceAfter: lender.walletBalance,
    };
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
}
