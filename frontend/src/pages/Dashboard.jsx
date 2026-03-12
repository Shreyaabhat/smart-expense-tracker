// ============================================
// Dashboard Page
// Main overview with stats, charts, AI insights
// ============================================

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp, PieChart, Zap, Plus, ArrowRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell,
} from "recharts";
import { expenseAPI, aiAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getCategoryColor, getMonthName } from "../utils/helpers";
import StatCard from "../components/common/StatCard";
import InsightCard from "../components/dashboard/InsightCard";
import LoadingSpinner from "../components/common/LoadingSpinner";

// Currency symbols map
const CURRENCY_SYMBOLS = {
  USD: "$", EUR: "€", GBP: "£", INR: "₹", CAD: "CA$",
  AUD: "A$", JPY: "¥", SGD: "S$", AED: "AED", CHF: "CHF",
  MXN: "MX$", BRL: "R$", KRW: "₩", CNY: "¥",
};

const Dashboard = () => {
  const { user } = useAuth();
  const [analytics,       setAnalytics]       = useState(null);
  const [insights,        setInsights]        = useState([]);
  const [prediction,      setPrediction]      = useState(null);
  const [recentExpenses,  setRecentExpenses]  = useState([]);
  const [loading,         setLoading]         = useState(true);

  // Read from localStorage first (set by Profile page), then profile, then USD
  const userCurrency   = localStorage.getItem("preferredCurrency") || user?.currency || "USD";
  const currencySymbol = CURRENCY_SYMBOLS[userCurrency] || userCurrency;

  // Format amount in user's currency
  const fmt = (amount) => {
    if (amount === undefined || amount === null) return "—";
    return `${currencySymbol}${parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    })}`;
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [analyticsRes, insightsRes, predictionRes, expensesRes] = await Promise.allSettled([
          expenseAPI.getAnalytics(),
          aiAPI.getInsights(),
          aiAPI.getPrediction(),
          expenseAPI.getAll({ limit: 5, sortBy: "date", sortOrder: "desc" }),
        ]);

        if (analyticsRes.status  === "fulfilled") setAnalytics(analyticsRes.value.data.analytics);
        if (insightsRes.status   === "fulfilled") setInsights(insightsRes.value.data.insights || []);
        if (predictionRes.status === "fulfilled") setPrediction(predictionRes.value.data.prediction);
        if (expensesRes.status   === "fulfilled") setRecentExpenses(expensesRes.value.data.expenses || []);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  const thisMonth = analytics?.thisMonth?.total || 0;
  const monthlyData = analytics?.monthlyTotals || [];

  // Format monthly data for the chart
  const chartData = monthlyData.map((m) => ({
    month: getMonthName(m._id.month),
    total: parseFloat(m.total.toFixed(2)),
  }));

  // Format category data for pie chart
  const pieData = (analytics?.categoryBreakdown || []).slice(0, 6).map((c) => ({
    name: c._id,
    value: parseFloat(c.total.toFixed(2)),
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-700 border border-surface-500 rounded-xl px-3 py-2 shadow-xl">
          <p className="text-xs text-gray-400">{label}</p>
          <p className="text-sm font-semibold text-brand-400 font-mono">
            {fmt(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-100">
            Good {new Date().getHours() < 12 ? "morning" : "evening"},{" "}
            {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Here's your financial overview</p>
        </div>
        <Link to="/add-expense" className="btn-primary flex items-center gap-2 hidden sm:flex">
          <Plus className="w-4 h-4" />
          Add Expense
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="This Month"
          value={fmt(analytics?.thisMonth?.total || 0)}
          icon={TrendingUp}
          color="brand"
          subtitle={`${userCurrency} spent`}
        />
        <StatCard
          title="Transactions"
          value={analytics?.thisMonth?.count || 0}
          icon={PieChart}
          color="blue"
          subtitle="this month"
        />
        <StatCard
          title="Predicted"
          value={prediction ? fmt(prediction.predicted_spending) : "—"}
          icon={TrendingUp}
          color="purple"
          subtitle="next month"
        />
        <StatCard
          title="Health Score"
          value={insights.find((i) => i.score)?.score ?? "—"}
          icon={Zap}
          color={insights.find((i) => i.score)?.score >= 70 ? "brand" : "yellow"}
          subtitle="out of 100"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Spending Trend Chart */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-100 mb-4">Spending Trend</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  tickFormatter={(v) => `${currencySymbol}${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="total" stroke="#22c55e"
                  strokeWidth={2} fill="url(#spendGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-gray-500">
              No spending data yet. Add your first expense!
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-100 mb-4">By Category</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <RechartsPie>
                <Pie data={pieData} cx="50%" cy="50%"
                  innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={getCategoryColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => fmt(val)}
                  contentStyle={{
                    background: "#182119", border: "1px solid #263527",
                    borderRadius: "12px", fontSize: "12px",
                  }}
                />
              </RechartsPie>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-gray-500">
              No categories yet
            </div>
          )}
        </div>
      </div>

      {/* AI Insights & Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI Insights */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-100">AI Insights</h3>
            <span className="text-xs text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
              Powered by ML
            </span>
          </div>
          {insights.length > 0 ? (
            <div className="space-y-3">
              {insights.slice(0, 3).map((insight, i) => (
                <InsightCard key={i} insight={insight} />
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 py-8 text-center">
              Add more expenses to unlock AI insights
            </div>
          )}
        </div>

        {/* Recent Expenses */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-100">Recent Expenses</h3>
            <Link to="/expenses" className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentExpenses.length > 0 ? (
            <div className="space-y-1">
              {recentExpenses.map((expense) => {
                const expSym = CURRENCY_SYMBOLS[expense.currency] || expense.currency || currencySymbol;
                return (
                  <div key={expense._id} className="flex items-center justify-between py-2.5 border-b border-surface-600 last:border-0">
                    <div>
                      <p className="text-sm text-gray-100">{expense.description}</p>
                      <p className="text-xs text-gray-500">{expense.category}</p>
                    </div>
                  <p className="text-sm font-mono font-medium text-gray-100">
                      -{currencySymbol}{parseFloat(expense.amount).toFixed(2)}
                  </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-gray-500 py-8 text-center">
              No expenses yet.{" "}
              <Link to="/add-expense" className="text-brand-400">Add one!</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;