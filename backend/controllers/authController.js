const User = require("../models/User");
const { generateToken } = require("../middleware/auth");
const { AppError } = require("../middleware/errorHandler");

// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Log what we received (helps debug)
    console.log("Register attempt:", { name, email, passwordLength: password?.length });

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are all required",
      });
    }

    // Check duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Create user
    const user = await User.create({ name, email, password });
    console.log("User created:", user._id);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        theme: user.theme,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Register error:", error.message, error.stack);
    next(error);
  }
};

// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt:", { email });

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user — must use +password since select:false
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        theme: user.theme,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message, error.stack);
    next(error);
  }
};

// @route   GET /api/auth/profile
const getProfile = async (req, res, next) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, currency, monthlyIncomeGoal, notifications, theme } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, currency, monthlyIncomeGoal, notifications, theme },
      { new: true, runValidators: true }
    );

    res.json({ success: true, message: "Profile updated", user });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile, updateProfile };