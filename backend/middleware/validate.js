// ============================================
// Request Validation Middleware
// Uses express-validator for input sanitization
// ============================================

const { body, param, validationResult } = require("express-validator");
const { CATEGORIES } = require("../models/Expense");

// Generic middleware to check validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

// ---- Auth Validators ----

const validateRegister = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2-50 characters"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),

  handleValidationErrors,
];

const validateLogin = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

// ---- Expense Validators ----

const validateExpense = [
  body("amount")
    .isFloat({ min: 0.01, max: 1000000 })
    .withMessage("Amount must be between $0.01 and $1,000,000"),

  body("category")
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(", ")}`),

  body("description")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Description must be 1-200 characters"),

  body("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be a valid ISO 8601 date"),

  body("isRecurring").optional().isBoolean(),
  body("recurringFrequency")
    .optional()
    .isIn(["weekly", "monthly", "yearly", null]),

  handleValidationErrors,
];

// ---- Budget Validators ----

const validateBudget = [
  body("category").isIn(CATEGORIES).withMessage("Invalid category"),
  body("limit")
    .isFloat({ min: 1 })
    .withMessage("Budget limit must be at least $1"),
  body("period")
    .optional()
    .isIn(["weekly", "monthly", "yearly"])
    .withMessage("Period must be weekly, monthly, or yearly"),
  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateExpense,
  validateBudget,
};