// ============================================
// Expense Routes
// All routes require authentication
// ============================================

const express = require("express");
const router = express.Router();
const {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getAnalytics,
} = require("../controllers/expenseController");
const { protect } = require("../middleware/auth");
const { validateExpense } = require("../middleware/validate");

// Apply auth middleware to all routes in this router
router.use(protect);

router.route("/").get(getExpenses).post(validateExpense, createExpense);
router.route("/:id").put(validateExpense, updateExpense).delete(deleteExpense);
router.get("/data/analytics", getAnalytics);

module.exports = router;