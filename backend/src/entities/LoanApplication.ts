import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { numericTransformer } from "../utils/transformers";
import { User } from "./User";
import { Order } from "./Order";
import { LoanFunding } from "./LoanFunding";
import { RepaymentInstallment } from "./RepaymentInstallment";

@Entity("loan_applications")
export class LoanApplication {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "order_id", type: "uuid", unique: true })
  orderId: string;

  @OneToOne(() => Order, (order) => order.loanApplication)
  @JoinColumn({ name: "order_id" })
  order: Order;

  @Column({ name: "buyer_id", type: "uuid" })
  buyerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "buyer_id" })
  buyer: User;

  @Column({
    name: "requested_amount",
    type: "numeric",
    precision: 15,
    scale: 0,
    transformer: numericTransformer,
  })
  requestedAmount: number;

  @Column({
    name: "funded_amount",
    type: "numeric",
    precision: 15,
    scale: 0,
    default: 0,
    transformer: numericTransformer,
  })
  fundedAmount: number;

  @Column({ name: "term_months", type: "integer" })
  termMonths: number;

  @Column({
    name: "interest_rate",
    type: "numeric",
    precision: 5,
    scale: 4,
    transformer: numericTransformer,
  })
  interestRate: number;

  /** loan_status enum in DB */
  @Column({ type: "varchar", length: 50, default: "open" })
  status: string;

  @OneToMany(() => LoanFunding, (funding) => funding.loanApplication)
  fundings: LoanFunding[];

  @OneToMany(
    () => RepaymentInstallment,
    (installment) => installment.loanApplication,
  )
  repaymentInstallments: RepaymentInstallment[];

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;
}
