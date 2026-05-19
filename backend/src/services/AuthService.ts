import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { ServiceError } from "./ServiceError";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface RegisterResult {
  id: string;
  name: string;
  email: string;
  role: string;
  walletBalance: number;
  createdAt: Date;
}

export interface LoginResult {
  accessToken: string;
  tokenType: "Bearer";
  user: {
    id: string;
    name: string;
    role: string;
    walletBalance: number;
  };
}

export async function register(input: RegisterInput): Promise<RegisterResult> {
  const { name, email, password, role } = input;

  if (!["buyer", "lender"].includes(role)) {
    throw new ServiceError(
      400,
      "VALIDATION_ERROR",
      'role must be "buyer" or "lender".',
    );
  }

  const userRepo = AppDataSource.getRepository(User);
  const existing = await userRepo.findOne({ where: { email } });
  if (existing) {
    throw new ServiceError(400, "EMAIL_TAKEN", "Email is already registered.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = userRepo.create({
    name,
    email,
    passwordHash,
    role,
    walletBalance: 500000000,
  });

  try {
    await userRepo.save(user);
  } catch (err: unknown) {
    // Handle unique constraint violation (PostgreSQL error code 23505)
    if ((err as { code?: string }).code === "23505") {
      throw new ServiceError(
        400,
        "EMAIL_TAKEN",
        "Email is already registered.",
      );
    }
    throw err;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    walletBalance: user.walletBalance,
    createdAt: user.createdAt,
  };
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResult> {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { email } });

  if (!user) {
    throw new ServiceError(
      401,
      "INVALID_CREDENTIALS",
      "Invalid email or password.",
    );
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new ServiceError(
      401,
      "INVALID_CREDENTIALS",
      "Invalid email or password.",
    );
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" },
  );

  return {
    accessToken: token,
    tokenType: "Bearer",
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      walletBalance: user.walletBalance,
    },
  };
}
