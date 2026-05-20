import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { ServiceError } from "./ServiceError";

export async function getBalance(userId: string): Promise<{ balance: number }> {
  const user = await AppDataSource.getRepository(User).findOne({
    where: { id: userId },
  });
  if (!user) {
    throw new ServiceError(404, "NOT_FOUND", "User not found.");
  }
  return { balance: user.walletBalance };
}
