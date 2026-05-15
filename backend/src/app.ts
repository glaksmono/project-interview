import "express-async-errors";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import orderRoutes from "./routes/orders";
import loanRoutes from "./routes/loans";
import walletRoutes from "./routes/wallet";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/loans", loanRoutes);
app.use("/api/v1/wallet", walletRoutes);

app.use(errorHandler);

export default app;
