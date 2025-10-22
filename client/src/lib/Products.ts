import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/";
const api = axios.create({ baseURL: API_URL, withCredentials: true });

export const getProducts = async (category?: string) => {
  const params: Record<string, string> = {};
  if (category) params.category = category;
  const resp = await api.get("/api/products", { params });
  return resp.data;
};
