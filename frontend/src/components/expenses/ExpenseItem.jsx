// ============================================
// ExpenseItem Component
// Single expense row in the history list
// ============================================

import { Pencil, Trash2, RefreshCw } from "lucide-react";
import { formatDate, getCategoryColor } from "../../utils/helpers";
import { CATEGORY_ICONS } from "./categoryConfig";

const CURRENCY_SYMBOLS = {
  USD: "$", EUR: "€", GBP: "£", INR: "₹", CAD: "CA$",
  AUD: "A$", JPY: "¥", SGD: "S$", AED: "AED", CHF: "CHF",
  MXN: "MX$", BRL: "R$", KRW: "₩", CNY: "¥",
};

const ExpenseItem = ({ expense, onEdit, onDelete, preferredCurrency }) => {
  const icon  = CATEGORY_ICONS[expense.category] || "📦";
  const color = getCategoryColor(expense.category);

  // If the expense has a non-USD currency saved → use it (user explicitly chose it)
  // If it's USD or missing → use preferredCurrency (old expenses defaulted to USD)
  const savedCurrency = expense.currency;
  const currency = (savedCurrency && savedCurrency !== "USD")
    ? savedCurrency
    : (preferredCurrency || "INR");
  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-700/50 transition-colors group">
      {/* Category icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: color + "20", border: `1px solid ${color}30` }}
      >
        {icon}
      </div>

      {/* Description & category */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-100 truncate">{expense.description}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-500">{expense.category}</span>
          {expense.isRecurring && (
            <span className="flex items-center gap-1 text-xs text-brand-400">
              <RefreshCw className="w-2.5 h-2.5" />
              {expense.recurringFrequency}
            </span>
          )}
        </div>
      </div>

      {/* Date */}
      <div className="text-right hidden sm:block">
        <p className="text-xs text-gray-500">{formatDate(expense.date, "MMM dd")}</p>
      </div>

      {/* Amount */}
      <div className="text-right">
        <p className="text-sm font-semibold text-gray-100 font-mono">
          -{symbol}{parseFloat(expense.amount).toLocaleString(undefined, {
            minimumFractionDigits: 2, maximumFractionDigits: 2,
          })}
        </p>
        <p className="text-[10px] text-gray-500">{currency}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(expense)}
          className="p-1.5 rounded-lg text-gray-500 hover:text-brand-400 hover:bg-brand-500/10 transition-colors" title="Edit">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onDelete(expense._id)}
          className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default ExpenseItem;