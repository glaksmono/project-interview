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
import { User } from "./User";

@Entity("loan_fundings")
export class LoanFunding {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "loan_application_id", type: "uuid" })
  loanApplicationId: string;

  @ManyToOne(() => LoanApplication, (loan) => loan.fundings)
  @JoinColumn({ name: "loan_application_id" })
  loanApplication: LoanApplication;

  @Column({ name: "lender_id", type: "uuid" })
  lenderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "lender_id" })
  lender: User;

  @Column({
    type: "numeric",
    precision: 15,
    scale: 0,
    transformer: numericTransformer,
  })
  amount: number;

  @CreateDateColumn({ name: "funded_at", type: "timestamptz" })
  fundedAt: Date;
}
