// ============================================
// Budget Controller
// Manage per-category budget limits
// ============================================

const Budget = require("../models/Budget");
const { AppError } = require("../middleware/errorHandler");

// @desc    Create or update budget for a category
// @route   POST /api/budgets
// @access  Private
const upsertBudget = async (req, res, next) => {
  try {
    const { category, limit, period, alertThreshold } = req.body;

    // Upsert: create if not exists, update if exists
    const budget = await Budget.findOneAndUpdate(
      { userId: req.user._id, category },
      { limit, period, alertThreshold },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Budget saved",
      budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all budgets for user
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res, next) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id });
    res.json({ success: true, budgets });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!budget) {
      throw new AppError("Budget not found", 404);
    }

    res.json({ success: true, message: "Budget deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { upsertBudget, getBudgets, deleteBudget };