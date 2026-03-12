// ============================================
// StatCard Component
// Reusable metric card for the dashboard
// ============================================

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color = "brand" }) => {
  const colorClasses = {
    brand: "bg-brand-500/10 text-brand-400 border-brand-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "down" ? "text-brand-400" : trend === "up" ? "text-red-400" : "text-gray-500";

  return (
    <div className="card p-5 animate-fade-in hover:border-surface-500 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <p className="text-2xl font-semibold text-gray-100 font-mono mb-2">{value}</p>
      {(subtitle || trendValue) && (
        <div className="flex items-center gap-1.5">
          {trendValue && (
            <>
              <TrendIcon className={`w-3 h-3 ${trendColor}`} />
              <span className={`text-xs font-medium ${trendColor}`}>{trendValue}</span>
            </>
          )}
          {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;