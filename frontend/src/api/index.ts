import api from "./client";
import type {
  User,
  RegisterRequest,
  LoginRequest,
  CreateOrderRequest,
} from "../types";

export const register = (data: RegisterRequest) =>
  api.post<{ user: User; accessToken: string }>("/auth/register", data);
export const login = (data: LoginRequest) =>
  api.post<{ user: User; accessToken: string }>("/auth/login", data);

export const getProducts = () => api.get("/products");
export const createOrder = (data: CreateOrderRequest) =>
  api.post("/orders", data);
export const getOrders = () => api.get("/orders");
export const getOrderById = (id: string) =>
  api.get(`/orders/${encodeURIComponent(id)}`);

export const getLoans = () => api.get("/loans");
export const getLoanFundingHistory = () => api.get("/loans/history");
export const getLoanById = (id: string) =>
  api.get(`/loans/${encodeURIComponent(id)}`);
export const fundLoan = (id: string, amount: number) =>
  api.post(`/loans/${encodeURIComponent(id)}/fund`, { amount });

export const getWallet = () => api.get("/wallet");
