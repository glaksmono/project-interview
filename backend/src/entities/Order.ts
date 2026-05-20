import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { numericTransformer } from "../utils/transformers";
import { User } from "./User";
import { Product } from "./Product";
import { LoanApplication } from "./LoanApplication";

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "buyer_id", type: "uuid" })
  buyerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "buyer_id" })
  buyer: User;

  @Column({ name: "product_id", type: "uuid" })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: "product_id" })
  product: Product;

  @Column({ type: "integer" })
  quantity: number;

  @Column({
    name: "unit_price",
    type: "numeric",
    precision: 15,
    scale: 0,
    transformer: numericTransformer,
  })
  unitPrice: number;

  @Column({
    name: "total_amount",
    type: "numeric",
    precision: 15,
    scale: 0,
    transformer: numericTransformer,
  })
  totalAmount: number;

  /** payment_method enum in DB */
  @Column({ name: "payment_method", type: "varchar", length: 50 })
  paymentMethod: string;

  /** order_status enum in DB */
  @Column({ type: "varchar", length: 50, default: "pending_funding" })
  status: string;

  /** FK is on loan_applications.order_id — no JoinColumn here */
  @OneToOne(() => LoanApplication, (loan) => loan.order, {
    nullable: true,
    eager: false,
  })
  loanApplication: LoanApplication | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;
}
