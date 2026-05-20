import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { numericTransformer } from "../utils/transformers";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({
    type: "numeric",
    precision: 15,
    scale: 0,
    transformer: numericTransformer,
  })
  price: number;

  @Column({ name: "stock_quantity", type: "integer", default: 0 })
  stockQuantity: number;

  @Column({ type: "varchar", length: 100 })
  category: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;
}
