/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/";
const api = axios.create({ baseURL: API_URL, withCredentials: true });

export const createProduct = async (data: FormData) => {
  const resp = await api.post("/api/admin/products", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return resp.data;
};

export const fetchProducts = async (category?: string) => {
  const params: Record<string, string> = {};
  if (category) params.category = category;
  const resp = await api.get("/api/products", { params });
  return resp.data;
};

export const updateProduct = async (id: string, data: FormData | Record<string, any>) => {
  const headers = data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {};
  const resp = await api.put(`/api/products/${id}`, data, { headers });
  return resp.data;
};

export const deleteProduct = async (id: string) => {
  const resp = await api.delete(`/api/products/${id}`);
  return resp.data;
};
