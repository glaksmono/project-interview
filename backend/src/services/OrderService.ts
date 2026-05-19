import { AppDataSource } from "../config/database";
import { Order } from "../entities/Order";
import { Product } from "../entities/Product";
import { User } from "../entities/User";
import { LoanApplication } from "../entities/LoanApplication";
import { ServiceError } from "./ServiceError";

const INTEREST_RATE = 0.05;

// ─── Shared DTO helpers ────────────────────────────────────────────────────────

function loanSummary(loan: LoanApplication) {
  return {
    id: loan.id,
    fundedAmount: loan.fundedAmount,
    remainingAmount: loan.requestedAmount - loan.fundedAmount,
    status: loan.status,
  };
}

function loanDetail(loan: LoanApplication) {
  const monthlyInstallment = Math.round(
    (loan.requestedAmount * (1 + loan.interestRate)) / loan.termMonths,
  );
  return {
    id: loan.id,
    requestedAmount: loan.requestedAmount,
    fundedAmount: loan.fundedAmount,
    remainingAmount: loan.requestedAmount - loan.fundedAmount,
    termMonths: loan.termMonths,
    interestRate: loan.interestRate,
    monthlyInstallment,
    status: loan.status,
  };
}

// ─── createOrder ──────────────────────────────────────────────────────────────

export interface CreateOrderInput {
  buyerId: string;
  productId: string;
  quantity: number;
  paymentMethod: string;
  loanTermMonths?: number;
}

export interface CreateOrderResult {
  order: {
    id: string;
    product: { id: string; name: string };
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    paymentMethod: string;
    status: string;
    loanApplication: ReturnType<typeof loanDetail> | null;
    createdAt: Date;
  };
  walletBalanceAfter: number;
}

export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  const { buyerId, productId, quantity, paymentMethod, loanTermMonths } = input;

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const product = await queryRunner.manager
      .createQueryBuilder(Product, "p")
      .where("p.id = :id", { id: productId })
      .setLock("pessimistic_write")
      .getOne();

    if (!product) {
      throw new ServiceError(404, "NOT_FOUND", "Product not found.");
    }

    if (product.stockQuantity < quantity) {
      throw new ServiceError(
        422,
        "INSUFFICIENT_STOCK",
        "Not enough stock available.",
        {
          available: product.stockQuantity,
          requested: quantity,
        },
      );
    }

    const totalAmount = product.price * quantity;

    const buyer = await queryRunner.manager
      .createQueryBuilder(User, "u")
      .where("u.id = :id", { id: buyerId })
      .setLock("pessimistic_write")
      .getOne();

    if (!buyer) {
      throw new ServiceError(404, "NOT_FOUND", "User not found.");
    }

    // ── Direct payment ─────────────────────────────────────────────────────────
    if (paymentMethod === "direct") {
      if (buyer.walletBalance < totalAmount) {
        throw new ServiceError(
          422,
          "INSUFFICIENT_WALLET_BALANCE",
          "Your wallet balance is insufficient to complete this purchase.",
          { required: totalAmount, available: buyer.walletBalance },
        );
      }

      buyer.walletBalance -= totalAmount;
      product.stockQuantity -= quantity;

      const order = queryRunner.manager.create(Order, {
        buyerId: buyer.id,
        productId: product.id,
        quantity,
        unitPrice: product.price,
        totalAmount,
        paymentMethod: "direct",
        status: "confirmed",
      });

      await queryRunner.manager.save(order);
      await queryRunner.manager.save(buyer);
      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();

      return {
        order: {
          id: order.id,
          product: { id: product.id, name: product.name },
          quantity: order.quantity,
          unitPrice: order.unitPrice,
          totalAmount: order.totalAmount,
          paymentMethod: order.paymentMethod,
          status: order.status,
          loanApplication: null,
          createdAt: order.createdAt,
        },
        walletBalanceAfter: buyer.walletBalance,
      };
    }

    // ── Loan payment ───────────────────────────────────────────────────────────
    const order = queryRunner.manager.create(Order, {
      buyerId: buyer.id,
      productId: product.id,
      quantity,
      unitPrice: product.price,
      totalAmount,
      paymentMethod: "loan",
      status: "pending_funding",
    });
    await queryRunner.manager.save(order);

    const loan = queryRunner.manager.create(LoanApplication, {
      orderId: order.id,
      buyerId: buyer.id,
      requestedAmount: totalAmount,
      fundedAmount: 0,
      termMonths: loanTermMonths!,
      interestRate: INTEREST_RATE,
      status: "open",
    });
    await queryRunner.manager.save(loan);
    await queryRunner.commitTransaction();

    return {
      order: {
        id: order.id,
        product: { id: product.id, name: product.name },
        quantity: order.quantity,
        unitPrice: order.unitPrice,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        status: order.status,
        loanApplication: loanDetail(loan),
        createdAt: order.createdAt,
      },
      walletBalanceAfter: buyer.walletBalance,
    };
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
}

// ─── listOrders ───────────────────────────────────────────────────────────────

export async function listOrders(buyerId: string) {
  const orders = await AppDataSource.getRepository(Order).find({
    where: { buyerId },
    relations: ["product", "loanApplication"],
    order: { createdAt: "DESC" },
  });

  return orders.map((o) => ({
    id: o.id,
    product: o.product ? { id: o.product.id, name: o.product.name } : null,
    quantity: o.quantity,
    totalAmount: o.totalAmount,
    paymentMethod: o.paymentMethod,
    status: o.status,
    loanApplication: o.loanApplication ? loanSummary(o.loanApplication) : null,
    createdAt: o.createdAt,
  }));
}

// ─── getOrderById ─────────────────────────────────────────────────────────────

export async function getOrderById(orderId: string, buyerId: string) {
  const order = await AppDataSource.getRepository(Order).findOne({
    where: { id: orderId, buyerId },
    relations: [
      "product",
      "loanApplication",
      "loanApplication.repaymentInstallments",
    ],
  });

  if (!order) {
    throw new ServiceError(404, "NOT_FOUND", "Order not found.");
  }

  const loan = order.loanApplication;

  return {
    id: order.id,
    product: order.product
      ? { id: order.product.id, name: order.product.name }
      : null,
    quantity: order.quantity,
    unitPrice: order.unitPrice,
    totalAmount: order.totalAmount,
    paymentMethod: order.paymentMethod,
    status: order.status,
    loanApplication: loan
      ? {
          ...loanDetail(loan),
          repaymentSchedule: (loan.repaymentInstallments ?? [])
            .sort((a, b) => a.installmentNumber - b.installmentNumber)
            .map((r) => ({
              installmentNumber: r.installmentNumber,
              amount: r.amount,
              dueDate: (typeof r.dueDate === "string"
                ? r.dueDate
                : (r.dueDate as Date).toISOString()
              ).slice(0, 10),
              status: r.status,
            })),
        }
      : null,
    createdAt: order.createdAt,
  };
}
