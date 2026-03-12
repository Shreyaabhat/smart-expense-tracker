// ============================================
// Utility Helper Functions
// ============================================

import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";

// Format currency
export const formatCurrency = (amount, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format date for display
export const formatDate = (date, fmt = "MMM dd, yyyy") => {
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, fmt);
  } catch {
    return "Invalid date";
  }
};

// Get month name from a number (1-12)
export const getMonthName = (month) => {
  return format(new Date(2024, month - 1, 1), "MMM");
};

// Calculate percentage change between two values
export const percentageChange = (current, previous) => {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
};

// Category color mapping for charts
export const CATEGORY_COLORS = {
  "Food & Dining": "#22c55e",
  Transportation: "#3b82f6",
  Shopping: "#a855f7",
  Entertainment: "#f59e0b",
  Healthcare: "#ef4444",
  Housing: "#06b6d4",
  Utilities: "#8b5cf6",
  Education: "#ec4899",
  Travel: "#14b8a6",
  "Personal Care": "#f97316",
  Insurance: "#64748b",
  Investments: "#10b981",
  "Gifts & Donations": "#e11d48",
  Other: "#6b7280",
};

// Get color for a category (fallback to gray)
export const getCategoryColor = (category) =>
  CATEGORY_COLORS[category] || "#6b7280";

// Truncate long text
export const truncate = (str, n = 30) =>
  str?.length > n ? `${str.slice(0, n)}...` : str;

// Get error message from Axios error
export const getErrorMessage = (error) => {
  return (
    error.response?.data?.message ||
    error.response?.data?.errors?.[0]?.message ||
    error.message ||
    "Something went wrong"
  );
};

// Get the start and end of the current month
export const currentMonthRange = () => {
  const now = new Date();
  return {
    start: startOfMonth(now).toISOString(),
    end: endOfMonth(now).toISOString(),
  };
};

// Health score color
export const getHealthColor = (score) => {
  if (score >= 70) return "text-green-400";
  if (score >= 40) return "text-yellow-400";
  return "text-red-400";
};