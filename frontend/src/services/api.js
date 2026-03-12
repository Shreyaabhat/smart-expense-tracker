// ============================================
// API Service
// Centralized Axios instance with interceptors
// ============================================

import axios from "axios";

// Base URL — uses Vite proxy in dev, direct URL in production
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Create Axios instance with defaults
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ---- Request Interceptor ----
// Attach JWT token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Response Interceptor ----
// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ---- Auth API ----
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
};

// ---- Expense API ----
export const expenseAPI = {
  getAll: (params) => api.get("/expenses", { params }),
  create: (data) => api.post("/expenses", data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  getAnalytics: (params) => api.get("/expenses/data/analytics", { params }),
};

// ---- Budget API ----
export const budgetAPI = {
  getAll: () => api.get("/budgets"),
  save: (data) => api.post("/budgets", data),
  delete: (id) => api.delete(`/budgets/${id}`),
};

// ---- AI API ----
export const aiAPI = {
  getPrediction: () => api.get("/ai/prediction"),
  getInsights: () => api.get("/ai/insights"),
};

// ---- Piggy Bank API ----
export const piggyBankAPI = {
  get: () => api.get("/piggybank"),
  addDeposit: (data) => api.post("/piggybank/deposit", data),
  deleteDeposit: (depositId) => api.delete(`/piggybank/deposit/${depositId}`),
  updateSettings: (data) => api.put("/piggybank/settings", data),
  getCurrencies: () => api.get("/piggybank/currencies"),
  convert: (data) => api.post("/piggybank/convert", data),
};

export default api;