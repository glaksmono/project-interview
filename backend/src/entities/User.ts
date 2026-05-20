import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { numericTransformer } from "../utils/transformers";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ name: "password_hash", type: "varchar", length: 255 })
  passwordHash: string;

  /** user_role enum in DB — stored as varchar for TypeORM compatibility */
  @Column({ type: "varchar", length: 50 })
  role: string;

  @Column({
    name: "wallet_balance",
    type: "numeric",
    precision: 15,
    scale: 0,
    default: 500000000,
    transformer: numericTransformer,
  })
  walletBalance: number;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;
}
