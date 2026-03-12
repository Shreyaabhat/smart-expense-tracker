// ============================================
// Analytics Page
// Detailed spending charts and breakdowns
// ============================================

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from "recharts";
import { expenseAPI, aiAPI } from "../services/api";
import { formatCurrency, getCategoryColor, getMonthName } from "../utils/helpers";
import LoadingSpinner from "../components/common/LoadingSpinner";
import InsightCard from "../components/dashboard/InsightCard";

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [a, i, p] = await Promise.allSettled([
        expenseAPI.getAnalytics({ months: 12 }),
        aiAPI.getInsights(),
        aiAPI.getPrediction(),
      ]);

      if (a.status === "fulfilled") setAnalytics(a.value.data.analytics);
      if (i.status === "fulfilled") setInsights(i.value.data.insights || []);
      if (p.status === "fulfilled") setPrediction(p.value.data.prediction);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" text="Crunching numbers..." />
    </div>
  );

  const monthlyData = (analytics?.monthlyTotals || []).map((m) => ({
    month: getMonthName(m._id.month),
    total: parseFloat(m.total.toFixed(2)),
    count: m.count,
  }));

  const categoryData = (analytics?.categoryBreakdown || []).map((c) => ({
    name: c._id,
    value: parseFloat(c.total.toFixed(2)),
    count: c.count,
    avg: parseFloat(c.avgAmount.toFixed(2)),
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-surface-700 border border-surface-500 rounded-xl px-3 py-2 shadow-xl text-xs">
        <p className="text-gray-400 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }} className="font-semibold">
            {p.name}: {p.name === "total" || p.name === "value" ? formatCurrency(p.value) : p.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-xl font-semibold text-gray-100">Analytics</h1>

      {/* Monthly Bar Chart */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-gray-100 mb-4">Monthly Spending (12 months)</h2>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData} barSize={20}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(34,197,94,0.05)" }} />
              <Bar dataKey="total" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-60 flex items-center justify-center text-sm text-gray-500">No data yet</div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Breakdown Table */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-100 mb-4">Spending by Category</h2>
          {categoryData.length > 0 ? (
            <div className="space-y-3">
              {categoryData.map((cat) => {
                const total = categoryData.reduce((s, c) => s + c.value, 0);
                const pct = total > 0 ? Math.round((cat.value / total) * 100) : 0;
                return (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-300">{cat.name}</span>
                      <span className="text-xs text-gray-400 font-mono">{formatCurrency(cat.value)}</span>
                    </div>
                    <div className="h-1.5 bg-surface-600 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: getCategoryColor(cat.name) }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">{pct}% of total · {cat.count} transactions</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-gray-500 py-8 text-center">No category data</div>
          )}
        </div>

        {/* AI Insights */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-100">AI Insights</h2>
            {prediction && (
              <div className="text-right">
                <p className="text-xs text-gray-500">Predicted next month</p>
                <p className="text-sm font-semibold font-mono text-brand-400">
                  {formatCurrency(prediction.predicted_spending)}
                </p>
              </div>
            )}
          </div>

          {prediction && (
            <div className="bg-brand-500/5 border border-brand-500/20 rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-400 leading-relaxed">{prediction.budget_suggestion}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${
                  prediction.trend === "decreasing"
                    ? "text-brand-400 border-brand-500/30 bg-brand-500/10"
                    : prediction.trend === "increasing"
                    ? "text-red-400 border-red-500/30 bg-red-500/10"
                    : "text-gray-400 border-gray-500/30 bg-gray-500/10"
                }`}>
                  {prediction.trend === "decreasing" ? "↓" : prediction.trend === "increasing" ? "↑" : "→"}{" "}
                  {prediction.trend}
                </span>
                <span className="text-xs text-gray-500">
                  Confidence: {Math.round((prediction.confidence || 0) * 100)}%
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {insights.map((insight, i) => (
              <InsightCard key={i} insight={insight} />
            ))}
          </div>

          {insights.length === 0 && (
            <div className="text-sm text-gray-500 py-8 text-center">
              Add more expenses to unlock AI insights
            </div>
          )}
        </div>
      </div>

      {/* Budget Status */}
      {analytics?.budgetStatus?.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-100 mb-4">Budget Status This Month</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {analytics.budgetStatus.map((budget) => (
              <div key={budget.category} className={`rounded-xl border p-4 ${
                budget.status === "exceeded" ? "border-red-500/30 bg-red-500/5"
                  : budget.status === "warning" ? "border-yellow-500/30 bg-yellow-500/5"
                  : "border-surface-600 bg-surface-700/50"
              }`}>
                <p className="text-xs font-medium text-gray-300 mb-2">{budget.category}</p>
                <div className="h-1.5 bg-surface-600 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full ${
                      budget.status === "exceeded" ? "bg-red-500"
                        : budget.status === "warning" ? "bg-yellow-500"
                        : "bg-brand-500"
                    }`}
                    style={{ width: `${Math.min(100, budget.percentage)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">{formatCurrency(budget.spent)} spent</span>
                  <span className="text-gray-500">of {formatCurrency(budget.limit)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;