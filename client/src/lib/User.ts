import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/";

const api = axios.create({baseURL: API_URL, withCredentials: true,})

export const getCurrentUser = async () => {
  try {
    const response = await api.get("/api/user/current");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (name: string, email: string) => {
  try {
    const response = await api.patch("/api/user/update-profile", { name, email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addUserAddress = async (street: string, city: string, state: string, postalCode: string, country: string, phone: string) => {
  try {
    const response = await api.post("/api/user/add-address", { street, city, state, postalCode, country, phone });
    return response.data;
  } catch (error) {
    console.error("Error adding address:", error);
    throw error;
  }
};

export const deleteUserAddress = async (addressId: string) => {
  try {
    const response = await api.delete(`/api/user/delete-address/${addressId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};