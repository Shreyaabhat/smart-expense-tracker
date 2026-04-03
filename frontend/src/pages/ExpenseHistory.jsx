// ============================================
// Expense History
// Each expense shows in the currency it was saved in
// ============================================

import { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import useExpenses from "../hooks/useExpenses";
import ExpenseItem from "../components/expenses/ExpenseItem";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ExpenseForm from "../components/expenses/ExpenseForm";
import { CATEGORIES } from "../components/expenses/Categoryconfig";
import { getErrorMessage } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";

const ExpenseHistory = () => {
  const { user } = useAuth();
  const { expenses, pagination, loading, error, fetchExpenses, updateExpense, deleteExpense } = useExpenses();

  const [filters,        setFilters]        = useState({ category: "", search: "" });
  const [page,           setPage]           = useState(1);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteConfirm,  setDeleteConfirm]  = useState(null);
  const [actionError,    setActionError]    = useState(null);

  // Single source of truth: localStorage("preferredCurrency")
  // This is set directly by Profile.jsx when user saves currency preference
  // Force INR as default if nothing is set yet
  if (!localStorage.getItem("preferredCurrency")) {
    localStorage.setItem("preferredCurrency", "INR");
  }

  const [preferredCurrency, setPreferredCurrency] = useState(
    () => localStorage.getItem("preferredCurrency") || "INR"
  );

  // Poll localStorage every time the page becomes visible (handles coming from Profile page)
  useEffect(() => {
    const sync = () => {
      const cur = localStorage.getItem("preferredCurrency") || "INR";
      setPreferredCurrency(cur);
    };
    sync(); // run on mount
    window.addEventListener("focus", sync);       // tab refocused
    window.addEventListener("storage", sync);     // localStorage changed
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    fetchExpenses({
      page,
      limit: 20,
      category: filters.category || undefined,
      search:   filters.search   || undefined,
    });
  }, [page, filters, fetchExpenses]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setPage(1);
  };

  const handleEdit = async (data) => {
    await updateExpense(editingExpense._id, data);
    setEditingExpense(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      setDeleteConfirm(null);
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-100">Expense History</h1>
          <p className="text-sm text-gray-400 mt-0.5">{pagination.total || 0} total expenses</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search expenses..."
            className="input pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="input pl-10 pr-8 appearance-none min-w-[160px]"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        {(filters.category || filters.search) && (
          <button
            onClick={() => { setFilters({ category: "", search: "" }); setPage(1); }}
            className="btn-ghost flex items-center gap-2 text-sm"
          >
            <X className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {/* Expenses List */}
      <div className="card divide-y divide-surface-600">
        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner text="Loading expenses..." />
          </div>
        ) : error ? (
          <div className="py-12 text-center text-sm text-red-400">{error}</div>
        ) : expenses.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-500">
            No expenses found.{" "}
            {!filters.category && !filters.search && "Add your first expense!"}
          </div>
        ) : (
          expenses.map((expense) => (
            <ExpenseItem
              key={expense._id}
              expense={expense}
              onEdit={setEditingExpense}
              onDelete={setDeleteConfirm}
              preferredCurrency={preferredCurrency}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="btn-ghost text-sm disabled:opacity-30">Previous</button>
          <span className="text-sm text-gray-400">Page {page} of {pagination.pages}</span>
          <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
            className="btn-ghost text-sm disabled:opacity-30">Next</button>
        </div>
      )}

      {/* Edit Modal */}
      {editingExpense && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-100">Edit Expense</h2>
              <button onClick={() => setEditingExpense(null)} className="btn-ghost p-2">
                <X className="w-4 h-4" />
              </button>
            </div>
            <ExpenseForm
              initialData={{
                ...editingExpense,
                date: new Date(editingExpense.date).toISOString().split("T")[0],
              }}
              onSubmit={handleEdit}
              submitLabel="Save Changes"
            />
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-sm">
            <h2 className="text-base font-semibold text-gray-100 mb-2">Delete Expense?</h2>
            <p className="text-sm text-gray-400 mb-5">This action cannot be undone.</p>
            {actionError && <p className="text-sm text-red-400 mb-3">{actionError}</p>}
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 py-2 px-4 rounded-xl text-sm font-medium">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseHistory;