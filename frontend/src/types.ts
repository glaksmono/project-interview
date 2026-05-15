export type UserRole = "buyer" | "lender";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  walletBalance: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
}

export interface LoanApplicationSummary {
  id: string;
  fundedAmount: number;
  remainingAmount: number;
  status: string;
}

export interface LoanApplicationDetail extends LoanApplicationSummary {
  requestedAmount: number;
  termMonths: number;
  interestRate: number;
  monthlyInstallment: number;
}

export interface RepaymentInstallment {
  installmentNumber: number;
  amount: number;
  dueDate: string;
  status: string;
}

export interface OrderSummary {
  id: string;
  product: { id: string; name: string } | null;
  quantity: number;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  loanApplication: LoanApplicationSummary | null;
  createdAt: string;
}

export interface OrderDetail {
  id: string;
  product: { id: string; name: string } | null;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  loanApplication:
    | (LoanApplicationDetail & { repaymentSchedule: RepaymentInstallment[] })
    | null;
  createdAt: string;
}

export interface Funding {
  id: string;
  lender: { id: string; name: string };
  amount: number;
  fundedAt: string;
}

export interface LoanSummary {
  id: string;
  borrower: { id: string; name: string };
  orderId: string;
  requestedAmount: number;
  fundedAmount: number;
  remainingAmount: number;
  termMonths: number;
  interestRate: number;
  monthlyInstallment: number;
  status: string;
  createdAt: string;
}

export interface LoanDetail extends LoanSummary {
  fundings: Funding[];
}

export interface LoanFundingHistoryItem {
  id: string;
  amount: number;
  fundedAt: string;
  estimatedReturnAmount: number;
  estimatedProfit: number;
  borrower: { id: string; name: string } | null;
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
    createdAt: string;
  } | null;
  product: {
    id: string;
    name: string;
    category: string;
    price: number;
  } | null;
}
