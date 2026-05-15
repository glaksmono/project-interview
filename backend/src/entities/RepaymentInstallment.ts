import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { numericTransformer } from "../utils/transformers";
import { LoanApplication } from "./LoanApplication";

@Entity("repayment_installments")
export class RepaymentInstallment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "loan_application_id", type: "uuid" })
  loanApplicationId: string;

  @ManyToOne(() => LoanApplication, (loan) => loan.repaymentInstallments)
  @JoinColumn({ name: "loan_application_id" })
  loanApplication: LoanApplication;

  @Column({ name: "installment_number", type: "integer" })
  installmentNumber: number;

  @Column({
    type: "numeric",
    precision: 15,
    scale: 0,
    transformer: numericTransformer,
  })
  amount: number;

  /** DATE column — stored and returned as YYYY-MM-DD */
  @Column({ name: "due_date", type: "date" })
  dueDate: string;

  /** installment_status enum in DB */
  @Column({ type: "varchar", length: 50, default: "pending" })
  status: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;
}
