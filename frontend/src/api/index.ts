import api from "./client";

export const register = (data: Record<string, unknown>) =>
  api.post("/auth/register", data);
export const login = (data: { email: string; password: string }) =>
  api.post("/auth/login", data);

export const getProducts = () => api.get("/products");

export const createOrder = (data: Record<string, unknown>) =>
  api.post("/orders", data);
export const getOrders = () => api.get("/orders");
export const getOrderById = (id: string) => api.get(`/orders/${id}`);

export const getLoans = () => api.get("/loans");
export const getLoanFundingHistory = () => api.get("/loans/history");
export const getLoanById = (id: string) => api.get(`/loans/${id}`);
export const fundLoan = (id: string, amount: number) =>
  api.post(`/loans/${id}/fund`, { amount });

export const getWallet = () => api.get("/wallet");
