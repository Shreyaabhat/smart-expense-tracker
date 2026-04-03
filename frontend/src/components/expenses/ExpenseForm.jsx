
// ============================================
// Expense Form Component
// Add or Edit an expense
// ============================================

import { useState } from "react";
import { CATEGORIES } from "./Categoryconfig";
import { getErrorMessage } from "../../utils/helpers";
import LoadingSpinner from "../common/LoadingSpinner";

const defaultForm = {
  amount: "",
  category: "Food & Dining",
  description: "",
  date: new Date().toISOString().split("T")[0],
  isRecurring: false,
  recurringFrequency: "",
  notes: "",
};

const ExpenseForm = ({ onSubmit, initialData = null, submitLabel = "Add Expense" }) => {
  const [form, setForm] = useState(initialData || defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "isRecurring" ? value === "true" : value,
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    const payload = {
      ...form,
      amount: parseFloat(form.amount),
    };

    if (!payload.isRecurring) {
      delete payload.recurringFrequency;
    }

    await onSubmit(payload);
  } catch (err) {
    setError(getErrorMessage(err));
  } finally {
    setLoading(false);
  }
};

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Amount */}
      <div>
        <label className="label">Amount</label>
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          min="1"
          step="1"
          placeholder="Enter amount (₹)"
          required
          className="input font-mono text-lg"
        />
      </div>

      {/* Category */}
      <div>
        <label className="label">Category</label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="input"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="label">Description</label>
        <input
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="What did you spend on?"
          required
          maxLength={200}
          className="input"
        />
      </div>

      {/* Date */}
      <div>
        <label className="label">Date</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
          className="input"
        />
      </div>

      {/* Expense Type */}
      <div>
        <label className="label">Expense Type</label>
        <select
          name="isRecurring"
          value={form.isRecurring}
          onChange={handleChange}
          className="input"
        >
          <option value={false}>One-time Expense</option>
          <option value={true}>Recurring Expense</option>
        </select>
      </div>

      {/* Recurring Frequency */}
      {form.isRecurring && (
        <div>
          <label className="label">Frequency</label>
          <select
            name="recurringFrequency"
            value={form.recurringFrequency}
            onChange={handleChange}
            className="input"
          >
            <option value="">Select frequency</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="label">Notes (optional)</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Any additional notes..."
          maxLength={500}
          rows={3}
          className="input resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3 text-base"
      >
        {loading ? <LoadingSpinner size="sm" /> : submitLabel}
      </button>
    </form>
  );
};

export default ExpenseForm;

