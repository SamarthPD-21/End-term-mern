import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/";

const api = axios.create({baseURL: API_URL, withCredentials: true,})

export const login = async (email: string, password: string) => {
  try {
    const response = await api.get("/api/auth/signin", { params: { email, password } });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const signup = async (name: string, email: string, password: string) => {
  try {
    const response = await api.post("/api/auth/signup", { name, email, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await api.post("/api/auth/signout");
    return response.data;
  } catch (error) {
    throw error;
  }
};