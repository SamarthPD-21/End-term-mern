import axios from "axios";

// When NEXT_PUBLIC_API_URL is not set, use relative URLs so client calls the same origin
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

const api = axios.create({ baseURL: API_URL || undefined, withCredentials: true });

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

export const uploadProfileImage = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("image", file);
    const response = await api.post("/api/user/upload-profile-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const promoteToAdmin = async (email: string, reason?: string) => {
  try {
    const payload: Record<string, unknown> = { email };
    if (reason) payload.reason = reason;
    const response = await api.post("/api/admin/make-admin", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const demoteFromAdmin = async (email: string, reason?: string) => {
  try {
    const payload: Record<string, unknown> = { email };
    if (reason) payload.reason = reason;
    const response = await api.post("/api/admin/remove-admin", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchAllUsers = async () => {
  try {
    const response = await api.get('/api/admin/users');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchAdminAudits = async (page = 1, pageSize = 50, q?: string) => {
  try {
    const params: Record<string, unknown> = { page, pageSize };
    if (q) params.q = q;
    const response = await api.get('/api/admin/audits', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};