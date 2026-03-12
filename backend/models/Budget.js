// ============================================
// Expense Model
// MongoDB schema for expense records
// ============================================

const mongoose = require("mongoose");

// Valid expense categories
const CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Healthcare",
  "Housing",
  "Utilities",
  "Education",
  "Travel",
  "Personal Care",
  "Insurance",
  "Investments",
  "Gifts & Donations",
  "Other",
];

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true, // Index for faster queries
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
      max: [1000000, "Amount cannot exceed 1,000,000"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: CATEGORIES,
        message: `Category must be one of: ${CATEGORIES.join(", ")}`,
      },
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringFrequency: {
      type: String,
      enum: ["weekly", "monthly", "yearly", null],
      default: null,
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 30,
      },
    ],
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for common query pattern: get user's expenses by date
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });

// Virtual: formatted amount (for display)
expenseSchema.virtual("formattedAmount").get(function () {
  return `$${this.amount.toFixed(2)}`;
});

// Static method: get monthly totals for a user
expenseSchema.statics.getMonthlyTotals = async function (userId, months = 6) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
        },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);
};

// Static method: get category breakdown for a user
expenseSchema.statics.getCategoryBreakdown = async function (
  userId,
  startDate,
  endDate
) {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
        avgAmount: { $avg: "$amount" },
      },
    },
    { $sort: { total: -1 } },
  ]);
};

module.exports = mongoose.models.Expense || mongoose.model("Expense", expenseSchema);
module.exports.CATEGORIES = CATEGORIES;