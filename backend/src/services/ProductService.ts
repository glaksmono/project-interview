import { AppDataSource } from "../config/database";
import { Product } from "../entities/Product";

export interface ProductDTO {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  category: string;
}

export async function listProducts(): Promise<ProductDTO[]> {
  const products = await AppDataSource.getRepository(Product).find({
    order: { name: "ASC" },
  });
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    stockQuantity: p.stockQuantity,
    category: p.category,
  }));
}
