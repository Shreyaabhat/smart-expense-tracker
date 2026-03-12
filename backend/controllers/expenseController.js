// ============================================
// Expense Controller
// Full CRUD operations for expense records
// ============================================

const Expense = require("../models/Expense");
const Budget = require("../models/Budget");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../utils/logger");

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res, next) => {
  try {
    const { amount, category, description, date, isRecurring, recurringFrequency, tags, notes } = req.body;

    const expense = await Expense.create({
      userId: req.user._id,
      amount,
      category,
      description,
      date: date || new Date(),
      isRecurring,
      recurringFrequency,
      tags,
      notes,
    });

    // Check if this expense exceeds the budget limit
    const budget = await Budget.findOne({ userId: req.user._id, category });
    let budgetAlert = null;

    if (budget) {
      // Calculate current month spending for this category
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const monthTotal = await Expense.aggregate([
        {
          $match: {
            userId: req.user._id,
            category,
            date: { $gte: startOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const spent = monthTotal[0]?.total || 0;
      const percentage = (spent / budget.limit) * 100;

      if (percentage >= 100) {
        budgetAlert = {
          type: "exceeded",
          message: `You've exceeded your ${category} budget of $${budget.limit}!`,
          percentage: Math.round(percentage),
        };
      } else if (percentage >= budget.alertThreshold) {
        budgetAlert = {
          type: "warning",
          message: `You've used ${Math.round(percentage)}% of your ${category} budget.`,
          percentage: Math.round(percentage),
        };
      }
    }

    res.status(201).json({
      success: true,
      message: "Expense added successfully",
      expense,
      budgetAlert,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all expenses for the user
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      startDate,
      endDate,
      sortBy = "date",
      sortOrder = "desc",
      search,
    } = req.query;

    // Build filter object
    const filter = { userId: req.user._id };

    if (category) filter.category = category;
    if (search) {
      filter.description = { $regex: search, $options: "i" };
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObject = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [expenses, total] = await Promise.all([
      Expense.find(filter).sort(sortObject).skip(skip).limit(parseInt(limit)),
      Expense.countDocuments(filter),
    ]);

    res.json({
      success: true,
      expenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id, // Ensure the user owns this expense
    });

    if (!expense) {
      throw new AppError("Expense not found", 404);
    }

    const { amount, category, description, date, isRecurring, recurringFrequency, tags, notes } = req.body;

    expense.amount = amount ?? expense.amount;
    expense.category = category ?? expense.category;
    expense.description = description ?? expense.description;
    expense.date = date ?? expense.date;
    expense.isRecurring = isRecurring ?? expense.isRecurring;
    expense.recurringFrequency = recurringFrequency ?? expense.recurringFrequency;
    expense.tags = tags ?? expense.tags;
    expense.notes = notes ?? expense.notes;

    await expense.save();

    res.json({
      success: true,
      message: "Expense updated",
      expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!expense) {
      throw new AppError("Expense not found", 404);
    }

    res.json({
      success: true,
      message: "Expense deleted",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expense analytics (summary data)
// @route   GET /api/expenses/analytics
// @access  Private
const getAnalytics = async (req, res, next) => {
  try {
    const { months = 6 } = req.query;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Run all aggregations in parallel for speed
    const [monthlyTotals, categoryBreakdown, thisMonthTotal, totalExpenses] =
      await Promise.all([
        Expense.getMonthlyTotals(req.user._id, parseInt(months)),
        Expense.getCategoryBreakdown(req.user._id, startOfMonth, endOfMonth),
        Expense.aggregate([
          {
            $match: {
              userId: req.user._id,
              date: { $gte: startOfMonth, $lte: endOfMonth },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
        ]),
        Expense.countDocuments({ userId: req.user._id }),
      ]);

    // Get budgets to calculate status
    const budgets = await Budget.find({ userId: req.user._id });

    // Calculate budget status for each category this month
    const budgetStatus = await Promise.all(
      budgets.map(async (budget) => {
        const spent = categoryBreakdown.find((c) => c._id === budget.category)?.total || 0;
        return {
          category: budget.category,
          limit: budget.limit,
          spent,
          remaining: budget.limit - spent,
          percentage: Math.round((spent / budget.limit) * 100),
          status: spent > budget.limit ? "exceeded" : spent / budget.limit >= 0.8 ? "warning" : "ok",
        };
      })
    );

    res.json({
      success: true,
      analytics: {
        monthlyTotals,
        categoryBreakdown,
        thisMonth: {
          total: thisMonthTotal[0]?.total || 0,
          count: thisMonthTotal[0]?.count || 0,
        },
        totalExpenses,
        budgetStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getAnalytics,
};