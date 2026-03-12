// ============================================
// AI Controller
// Fetches AI predictions and insights from ML microservice
// Falls back to rule-based insights if ML is unavailable
// ============================================

const axios = require("axios");
const Expense = require("../models/Expense");

// @desc    Get spending prediction for next month
// @route   GET /api/ai/prediction
// @access  Private
const getPrediction = async (req, res, next) => {
  try {
    // Fetch 6 months of actual spending history
    const monthlyTotals = await Expense.getMonthlyTotals(req.user._id, 6);

    // ── Add recurring expenses to each month's total ──────────────────
    // Find all recurring expenses for this user
    const recurringExpenses = await Expense.find({
      userId: req.user._id,
      isRecurring: true,
    }).select("amount recurringFrequency");

    // Calculate how much recurring adds per month
    const recurringMonthly = recurringExpenses.reduce((sum, e) => {
      if (e.recurringFrequency === "monthly") return sum + e.amount;
      if (e.recurringFrequency === "weekly")  return sum + e.amount * 4.33; // avg weeks/month
      if (e.recurringFrequency === "yearly")  return sum + e.amount / 12;
      return sum;
    }, 0);

    // Add recurring amount to each month that doesn't already include it
    // (existing months were entered manually, so recurring is additive)
    const adjustedTotals = monthlyTotals.map((m) => ({
      ...m,
      total: m.total + recurringMonthly,
    }));

    const dataToUse = adjustedTotals.length > 0 ? adjustedTotals : monthlyTotals;

    if (dataToUse.length < 2) {
      return res.json({
        success: true,
        prediction: {
          predicted_spending: recurringMonthly > 0 ? recurringMonthly : 0,
          budget_suggestion: recurringMonthly > 0
            ? `You have recurring expenses totalling ${recurringMonthly.toFixed(2)}/month. Add more expense history for full predictions.`
            : "Add at least 2 months of expenses to get predictions.",
          confidence: 0,
          message: "Not enough data",
        },
      });
    }

    // Try ML service first
    try {
      const mlResponse = await axios.post(
        `${process.env.ML_SERVICE_URL}/predict`,
        { monthly_data: dataToUse.map((m) => m.total) },
        { timeout: 5000 }
      );
      return res.json({ success: true, prediction: mlResponse.data });
    } catch (mlError) {
      console.warn(`ML service unavailable: ${mlError.message}. Using fallback.`);

      const amounts = dataToUse.map((m) => m.total);
      const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const recent = amounts.slice(-3);
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const predicted = recentAvg * 0.6 + avg * 0.4;

      return res.json({
        success: true,
        prediction: {
          predicted_spending: Math.round(predicted * 100) / 100,
          budget_suggestion: predicted < avg
            ? `Your spending is trending down! Suggested budget: ${Math.round(predicted * 0.95)}`
            : `Your spending is trending up. Consider a budget of ${Math.round(avg * 1.1)}`,
          confidence: 0.7,
          trend: predicted < avg ? "decreasing" : "increasing",
          source: "rule-based",
          recurring_included: recurringMonthly > 0,
          recurring_monthly: Math.round(recurringMonthly * 100) / 100,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI-powered financial insights
// @route   GET /api/ai/insights
// @access  Private
const getInsights = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Gather data for insights
    const [categoryBreakdown, monthlyTotals] = await Promise.all([
      Expense.getCategoryBreakdown(req.user._id, startOfMonth, endOfMonth),
      Expense.getMonthlyTotals(req.user._id, 3),
    ]);

    const totalThisMonth = categoryBreakdown.reduce((sum, c) => sum + c.total, 0);
    const insights = [];

    // ---- Insight 1: Biggest spending category ----
    if (categoryBreakdown.length > 0) {
      const top = categoryBreakdown[0];
      const pct = Math.round((top.total / totalThisMonth) * 100);
      insights.push({
        type: "info",
        icon: "💡",
        title: "Top Spending Category",
        message: `${top._id} accounts for ${pct}% of your spending this month ($${top.total.toFixed(2)}).`,
      });
    }

    // ---- Insight 2: Spending trend ----
    if (monthlyTotals.length >= 2) {
      const latest = monthlyTotals[monthlyTotals.length - 1].total;
      const previous = monthlyTotals[monthlyTotals.length - 2].total;
      const change = ((latest - previous) / previous) * 100;

      if (Math.abs(change) > 5) {
        insights.push({
          type: change > 0 ? "warning" : "success",
          icon: change > 0 ? "📈" : "📉",
          title: "Spending Trend",
          message: change > 0
            ? `Your spending increased ${Math.abs(change).toFixed(0)}% compared to last month.`
            : `Great job! Spending decreased ${Math.abs(change).toFixed(0)}% vs last month.`,
        });
      }
    }

    // ---- Insight 3: Financial health score (0-100) ----
    const healthScore = calculateHealthScore(categoryBreakdown, totalThisMonth, monthlyTotals);

    insights.push({
      type: healthScore >= 70 ? "success" : healthScore >= 40 ? "warning" : "danger",
      icon: "🏆",
      title: "Financial Health Score",
      message: getHealthMessage(healthScore),
      score: healthScore,
    });

    // ---- Insight 4: Saving tips ----
    const tips = generateSavingTips(categoryBreakdown);
    if (tips.length > 0) {
      insights.push({
        type: "tip",
        icon: "💰",
        title: "Saving Tip",
        message: tips[0],
      });
    }

    res.json({
      success: true,
      insights,
      healthScore,
      totalThisMonth,
    });
  } catch (error) {
    next(error);
  }
};

// ---- Helper Functions ----

function calculateHealthScore(categories, total, monthlyTotals) {
  if (total === 0) return 100;

  let score = 100;

  // Penalize if a single category is >50% of spending
  if (categories[0] && categories[0].total / total > 0.5) score -= 20;

  // Penalize if spending is increasing month-over-month
  if (monthlyTotals.length >= 2) {
    const trend = monthlyTotals[monthlyTotals.length - 1].total - monthlyTotals[0].total;
    if (trend > 0) score -= Math.min(20, (trend / monthlyTotals[0].total) * 30);
  }

  // Reward for tracking consistently (more categories = better tracking)
  if (categories.length >= 5) score += 10;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function getHealthMessage(score) {
  if (score >= 80) return `Excellent! Your score is ${score}/100. Keep up the great financial habits!`;
  if (score >= 60) return `Good! Your score is ${score}/100. A few tweaks could improve your finances.`;
  if (score >= 40) return `Fair. Your score is ${score}/100. Review your spending habits.`;
  return `Needs attention. Your score is ${score}/100. Consider a budget review.`;
}

function generateSavingTips(categories) {
  const tips = [];
  const foodCategory = categories.find((c) => c._id === "Food & Dining");
  const entertainmentCategory = categories.find((c) => c._id === "Entertainment");

  if (foodCategory && foodCategory.total > 500) {
    tips.push("Your food spending is high. Try meal prepping to save up to 30% on food costs.");
  }
  if (entertainmentCategory && entertainmentCategory.total > 200) {
    tips.push("Consider free or low-cost entertainment alternatives to reduce this category.");
  }
  tips.push("Review subscriptions — the average person wastes $50+/month on unused subscriptions.");
  return tips;
}


module.exports = { getPrediction, getInsights };