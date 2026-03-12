// ============================================
// PiggyBank Model — Single currency design
// Everything stored in the user's chosen currency
// ============================================

const mongoose = require("mongoose");

const depositSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: [0.01, "Deposit must be at least 0.01"],
  },
  currency: {
    type: String,
    required: true,
  },
  // amountInUSD kept for backward compat with existing records but no longer used for display
  amountInUSD: { type: Number },
  note: { type: String, trim: true, maxlength: 200 },
  date: { type: Date, default: Date.now },
});

const piggyBankSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name:    { type: String, default: "My Piggy Bank", trim: true, maxlength: 50 },
    emoji:   { type: String, default: "🐷" },
    // The ONE currency everything is stored in
    currency: { type: String, default: "INR" },
    // kept for settings modal compat
    displayCurrency: { type: String, default: "INR" },
    goalAmount:   { type: Number, default: 0, min: 0 },
    goalCurrency: { type: String, default: "INR" },
    goalName:     { type: String, default: "", maxlength: 100 },
    deposits: [depositSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("PiggyBank", piggyBankSchema);