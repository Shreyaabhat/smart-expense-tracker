// ============================================
// InsightCard Component
// Displays an AI-generated insight
// ============================================

const typeStyles = {
  success: "border-brand-500/30 bg-brand-500/5",
  warning: "border-yellow-500/30 bg-yellow-500/5",
  danger: "border-red-500/30 bg-red-500/5",
  info: "border-blue-500/30 bg-blue-500/5",
  tip: "border-purple-500/30 bg-purple-500/5",
};

const InsightCard = ({ insight }) => {
  const style = typeStyles[insight.type] || typeStyles.info;

  return (
    <div className={`rounded-xl border p-4 ${style} animate-fade-in`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{insight.icon}</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-100 mb-0.5">{insight.title}</p>
          <p className="text-sm text-gray-400 leading-relaxed">{insight.message}</p>
        </div>
        {insight.score !== undefined && (
          <div className="text-right">
            <span className="text-2xl font-bold font-mono text-gray-100">{insight.score}</span>
            <p className="text-xs text-gray-500">/100</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightCard;