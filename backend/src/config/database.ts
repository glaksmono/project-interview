import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Product } from "../entities/Product";
import { Order } from "../entities/Order";
import { LoanApplication } from "../entities/LoanApplication";
import { LoanFunding } from "../entities/LoanFunding";
import { RepaymentInstallment } from "../entities/RepaymentInstallment";

const dbPort = parseInt(process.env.DB_PORT || "5432", 10);
if (isNaN(dbPort)) {
  throw new Error(`Invalid DB_PORT: ${process.env.DB_PORT}`);
}

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: dbPort,
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "project_interview",
  // Schema is managed via seed.sql — do not auto-sync entity definitions
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  entities: [
    User,
    Product,
    Order,
    LoanApplication,
    LoanFunding,
    RepaymentInstallment,
  ],
});
