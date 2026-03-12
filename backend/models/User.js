// ============================================
// User Model
// MongoDB schema for user accounts
// ============================================

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password in queries by default
    },
    currency: {
      type: String,
      default: "USD",
      enum: ["USD", "EUR", "GBP", "INR", "CAD", "AUD"],
    },
    monthlyIncomeGoal: {
      type: Number,
      default: 0,
    },
    notifications: {
      email: { type: Boolean, default: true },
      budgetAlerts: { type: Boolean, default: true },
    },
    theme: {
      type: String,
      default: "dark",
      enum: ["dark", "light"],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ---- MIDDLEWARE ----

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash if password was modified
  if (!this.isModified("password")) return next();

  try {
    // Salt rounds = 12 for production security
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ---- METHODS ----

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Return user data without sensitive fields
userSchema.methods.toPublicJSON = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    currency: this.currency,
    monthlyIncomeGoal: this.monthlyIncomeGoal,
    notifications: this.notifications,
    theme: this.theme,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", userSchema);