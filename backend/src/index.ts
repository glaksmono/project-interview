import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

import { AppDataSource } from "./config/database";
import app from "./app";

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log("✓ Database connected");
    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}/api/v1`);
    });
  })
  .catch((error: Error) => {
    console.error("✗ Database connection failed:", error.message);
    process.exit(1);
  });
