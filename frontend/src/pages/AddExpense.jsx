// ============================================
// Add Expense Page
// ============================================

import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useState } from "react";
import ExpenseForm from "../components/expenses/ExpenseForm";
import useExpenses from "../hooks/useExpenses";

const AddExpense = () => {
  const navigate = useNavigate();
  const { createExpense } = useExpenses();
  const [success, setSuccess] = useState(false);
  const [budgetAlert, setBudgetAlert] = useState(null);

  const handleSubmit = async (data) => {
    const result = await createExpense(data);
    if (result.budgetAlert) setBudgetAlert(result.budgetAlert);
    setSuccess(true);
    setTimeout(() => navigate("/expenses"), 2000);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 animate-fade-in">
        <div className="w-16 h-16 bg-brand-500/10 border border-brand-500/30 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-brand-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-100">Expense Added!</h2>
        {budgetAlert && (
          <div className={`rounded-xl border p-4 max-w-sm text-center text-sm ${
            budgetAlert.type === "exceeded"
              ? "bg-red-500/10 border-red-500/30 text-red-400"
              : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
          }`}>
            {budgetAlert.message}
          </div>
        )}
        <p className="text-sm text-gray-400">Redirecting to history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-100 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="card p-6">
        <h1 className="text-xl font-semibold text-gray-100 mb-1">Add Expense</h1>
        <p className="text-sm text-gray-400 mb-6">Track a new spending item</p>
        <ExpenseForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default AddExpense;