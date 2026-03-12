// ============================================
// Expense Heatmap Page
// GitHub-style daily spending heatmap
// ============================================

import { useState, useEffect } from "react";
import { expenseAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { Calendar } from "lucide-react";

const CURRENCY_SYMBOLS = {
  USD: "$", EUR: "€", GBP: "£", INR: "₹", CAD: "CA$",
  AUD: "A$", JPY: "¥", SGD: "S$", AED: "AED", CHF: "CHF",
  MXN: "MX$", BRL: "R$", KRW: "₩", CNY: "¥",
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const ExpenseHeatmap = () => {
  const [expenses,  setExpenses]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [tooltip,   setTooltip]   = useState(null);
  const [year,      setYear]      = useState(new Date().getFullYear());

  const currency = localStorage.getItem("preferredCurrency") || "INR";
  const symbol   = CURRENCY_SYMBOLS[currency] || currency;

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        // Fetch up to 1000 expenses to cover a full year
        const res = await expenseAPI.getAll({ limit: 1000, page: 1 });
        setExpenses(res.data.expenses || []);
      } catch {
        setExpenses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Build daily totals map for selected year: "YYYY-MM-DD" → total
  const dailyMap = {};
  expenses.forEach((e) => {
    const d = new Date(e.date);
    if (d.getFullYear() !== year) return;
    const key = d.toISOString().slice(0, 10);
    dailyMap[key] = (dailyMap[key] || 0) + e.amount;
  });

  const values = Object.values(dailyMap);
  const maxVal  = values.length ? Math.max(...values) : 1;

  // Color intensity based on spend level
  const getColor = (amount) => {
    if (!amount) return "bg-surface-700";
    const pct = amount / maxVal;
    if (pct < 0.25) return "bg-brand-900";
    if (pct < 0.50) return "bg-brand-700";
    if (pct < 0.75) return "bg-brand-500";
    return "bg-brand-400";
  };

  const getColorHex = (amount) => {
    if (!amount) return "#1e293b";
    const pct = amount / maxVal;
    if (pct < 0.25) return "#1e3a5f";
    if (pct < 0.50) return "#1d4ed8";
    if (pct < 0.75) return "#3b82f6";
    return "#60a5fa";
  };

  // Build weeks grid: Jan 1 of year → Dec 31
  const startDate = new Date(year, 0, 1);
  const endDate   = new Date(year, 11, 31);

  // Pad to start on Sunday
  const startDay = startDate.getDay(); // 0=Sun
  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null); // empty padding

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    cells.push(new Date(d));
  }

  // Group into weeks of 7
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  // Month label positions (which week index each month starts)
  const monthLabels = [];
  weeks.forEach((week, wi) => {
    week.forEach((day) => {
      if (day && day.getDate() <= 7) {
        const m = day.getMonth();
        if (!monthLabels.find(ml => ml.month === m)) {
          monthLabels.push({ month: m, weekIndex: wi });
        }
      }
    });
  });

  // Stats
  const totalSpent   = values.reduce((a, b) => a + b, 0);
  const activeDays   = values.length;
  const avgPerDay    = activeDays ? totalSpent / activeDays : 0;
  const highestDay   = Object.entries(dailyMap).sort((a, b) => b[1] - a[1])[0];

  const availableYears = [];
  const thisYear = new Date().getFullYear();
  for (let y = thisYear; y >= thisYear - 3; y--) availableYears.push(y);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" text="Loading heatmap..." />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-500/10 border border-brand-500/30 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-100">Expense Heatmap</h1>
            <p className="text-sm text-gray-400">Daily spending activity</p>
          </div>
        </div>

        {/* Year selector */}
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="input w-28 text-sm"
        >
          {availableYears.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Spent",   value: `${symbol}${totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
          { label: "Active Days",   value: `${activeDays} days` },
          { label: "Daily Average", value: `${symbol}${avgPerDay.toFixed(0)}` },
          { label: "Highest Day",   value: highestDay ? `${symbol}${highestDay[1].toFixed(0)}` : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="card p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-lg font-bold text-gray-100">{value}</p>
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="card p-6 overflow-x-auto">
        <div className="min-w-[600px]">

          {/* Month labels */}
          <div className="flex mb-1 ml-8">
            {weeks.map((_, wi) => {
              const ml = monthLabels.find(m => m.weekIndex === wi);
              return (
                <div key={wi} className="w-3.5 flex-shrink-0 text-center">
                  {ml ? (
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {MONTHS[ml.month]}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1">
              {DAYS.map((d, i) => (
                <div key={d} className="h-3.5 flex items-center">
                  {i % 2 === 1 && (
                    <span className="text-xs text-gray-600 w-7 text-right pr-1">{d}</span>
                  )}
                  {i % 2 === 0 && <span className="w-7" />}
                </div>
              ))}
            </div>

            {/* Weeks */}
            <div className="flex gap-0.5">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-0.5">
                  {week.map((day, di) => {
                    if (!day) return <div key={di} className="w-3.5 h-3.5" />;
                    const key = day.toISOString().slice(0, 10);
                    const amount = dailyMap[key] || 0;
                    return (
                      <div
                        key={di}
                        className={`w-3.5 h-3.5 rounded-sm cursor-pointer transition-transform hover:scale-125 ${getColor(amount)}`}
                        style={{ backgroundColor: amount ? getColorHex(amount) : undefined }}
                        onMouseEnter={(e) => setTooltip({
                          x: e.clientX, y: e.clientY,
                          date: key,
                          amount,
                        })}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 justify-end">
            <span className="text-xs text-gray-500">Less</span>
            {["#1e293b", "#1e3a5f", "#1d4ed8", "#3b82f6", "#60a5fa"].map((c) => (
              <div key={c} className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: c }} />
            ))}
            <span className="text-xs text-gray-500">More</span>
          </div>
        </div>
      </div>

      {/* Monthly breakdown */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-gray-100 mb-4">Monthly Breakdown</h2>
        <div className="space-y-3">
          {MONTHS.map((month, mi) => {
            const monthTotal = Object.entries(dailyMap)
              .filter(([k]) => parseInt(k.split("-")[1]) - 1 === mi)
              .reduce((s, [, v]) => s + v, 0);
            const pct = maxVal > 0 ? (monthTotal / (maxVal * 30)) * 100 : 0;
            return (
              <div key={month} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-8">{month}</span>
                <div className="flex-1 h-2 bg-surface-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, pct)}%`,
                      backgroundColor: "#3b82f6",
                    }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-20 text-right font-mono">
                  {monthTotal > 0 ? `${symbol}${monthTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-surface-800 border border-surface-600 rounded-xl px-3 py-2 text-xs shadow-xl pointer-events-none"
          style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}
        >
          <p className="text-gray-300 font-medium">{tooltip.date}</p>
          <p className="text-brand-400 font-bold">
            {tooltip.amount > 0 ? `${symbol}${tooltip.amount.toFixed(2)}` : "No spending"}
          </p>
        </div>
      )}
    </div>
  );
};

export default ExpenseHeatmap;