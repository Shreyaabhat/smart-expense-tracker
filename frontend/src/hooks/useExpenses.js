// ============================================
// useExpenses Hook
// Manages expense CRUD state and API calls
// ============================================

import { useState, useCallback } from "react";
import { expenseAPI } from "../services/api";
import { getErrorMessage } from "../utils/helpers";

const useExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExpenses = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await expenseAPI.getAll(params);
      setExpenses(res.data.expenses);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createExpense = useCallback(async (data) => {
    const res = await expenseAPI.create(data);
    setExpenses((prev) => [res.data.expense, ...prev]);
    return res.data;
  }, []);

  const updateExpense = useCallback(async (id, data) => {
    const res = await expenseAPI.update(id, data);
    setExpenses((prev) =>
      prev.map((e) => (e._id === id ? res.data.expense : e))
    );
    return res.data;
  }, []);

  const deleteExpense = useCallback(async (id) => {
    await expenseAPI.delete(id);
    setExpenses((prev) => prev.filter((e) => e._id !== id));
  }, []);

  return {
    expenses,
    pagination,
    loading,
    error,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
  };
};

export default useExpenses;