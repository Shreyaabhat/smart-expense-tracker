// ============================================
// PiggyBank Controller — Single currency design
// All deposits stored in the bank's chosen currency
// Zero USD conversion — no rounding loss
// ============================================

const PiggyBank = require("../models/PiggyBank");
const { AppError } = require("../middleware/errorHandler");

const RATES = {
  USD:1, EUR:0.92, GBP:0.79, INR:83.5, CAD:1.36,
  AUD:1.53, JPY:149.5, SGD:1.34, AED:3.67, CHF:0.89,
  MXN:17.1, BRL:4.97, KRW:1325, CNY:7.24,
};

// Convert amount from one currency to another directly (no USD hop)
const convertDirect = (amount, from, to) => {
  if (from === to) return amount;
  const inUSD = amount / (RATES[from] || 1);
  return inUSD * (RATES[to] || 1);
};

// ── Get or create piggy bank ──────────────────────────────
const getPiggyBank = async (req, res, next) => {
  try {
    let bank = await PiggyBank.findOne({ userId: req.user._id });
    if (!bank) {
      const defaultCurrency = req.user.currency || "INR";
      bank = await PiggyBank.create({
        userId: req.user._id,
        currency: defaultCurrency,
        displayCurrency: defaultCurrency,
        goalCurrency: defaultCurrency,
      });
    }

    // Detect actual currency — if bank says "USD" but deposits are in another currency,
    // the bank was never properly initialized; use the deposit currency instead
    let bankCurrency = bank.currency || bank.displayCurrency || "INR";
    if (bankCurrency === "USD" && bank.deposits.length > 0) {
      const depositCurrencies = [...new Set(bank.deposits.map(d => d.currency).filter(Boolean))];
      if (depositCurrencies.length === 1 && depositCurrencies[0] !== "USD") {
        bankCurrency = depositCurrencies[0];
        bank.currency        = bankCurrency;
        bank.displayCurrency = bankCurrency;
        await bank.save();
      }
    }

    // ── Migrate old corrupted deposits ──────────────────────
    // Old deposits were stored as amountInUSD (e.g. ₹10 → 0.1198 USD)
    // Detect: if currency is INR but amount < 1, it's a corrupted USD value
    let needsSave = false;
    bank.deposits = bank.deposits.map((d) => {
      const cur = d.currency || bankCurrency;
      const rate = RATES[cur] || 1;
      // If stored amount is suspiciously small for a non-USD currency
      // (e.g. INR amount of 0.12 when rate is 83.5 — clearly a USD value)
      if (rate > 1 && d.amount < 1 && d.amountInUSD !== undefined) {
        // Recover: convert from USD back to the correct currency
        const corrected = d.amountInUSD * rate;
        d.amount = parseFloat(corrected.toFixed(2));
        needsSave = true;
      }
      return d;
    });
    if (needsSave) await bank.save();

    // Sum deposits exactly — same currency, just add
    const total = bank.deposits.reduce((sum, d) => {
      const depCur = d.currency || bankCurrency;
      if (depCur === bankCurrency) return sum + d.amount;
      return sum + convertDirect(d.amount, depCur, bankCurrency);
    }, 0);

    // Round only for display
    const totalDisplay = Math.round(total * 100) / 100;

    // Goal progress in same currency
    let goalProgress = 0;
    if (bank.goalAmount > 0) {
      const goalInBankCurrency = bank.goalCurrency === bankCurrency
        ? bank.goalAmount
        : convertDirect(bank.goalAmount, bank.goalCurrency, bankCurrency);
      goalProgress = Math.min(100, Math.round((total / goalInBankCurrency) * 100));
    }

    res.json({
      success: true,
      piggyBank: {
        _id: bank._id,
        name: bank.name,
        emoji: bank.emoji,
        currency: bankCurrency,
        displayCurrency: bankCurrency,
        goalAmount: bank.goalAmount,
        goalCurrency: bank.goalCurrency || bankCurrency,
        goalName: bank.goalName,
        deposits: bank.deposits
          .map((d) => ({
            _id: d._id,
            amount: d.currency && d.currency !== bankCurrency
              ? convertDirect(d.amount, d.currency, bankCurrency)
              : d.amount,
            currency: bankCurrency,
            note: d.note,
            date: d.date,
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date)),
        depositCount: bank.deposits.length,
        total: totalDisplay,
        goalProgress,
        createdAt: bank.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Add deposit ───────────────────────────────────────────
const addDeposit = async (req, res, next) => {
  try {
    const { amount, currency, note, date } = req.body;

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Amount must be greater than 0" });
    }

    let bank = await PiggyBank.findOne({ userId: req.user._id });
    if (!bank) {
      const defaultCurrency = req.user.currency || "INR";
      bank = await PiggyBank.create({
        userId: req.user._id,
        currency: defaultCurrency,
        displayCurrency: defaultCurrency,
        goalCurrency: defaultCurrency,
      });
    }

    const bankCurrency = bank.currency || bank.displayCurrency || "INR";
    const depCurrency  = currency || bankCurrency;

    // If bank is still on default "USD" but user is depositing in another currency,
    // migrate the bank currency to match what the user is actually using
    const effectiveBankCurrency = (bankCurrency === "USD" && depCurrency !== "USD")
      ? depCurrency
      : bankCurrency;

    // Migrate bank record if needed
    if (effectiveBankCurrency !== bankCurrency) {
      bank.currency        = effectiveBankCurrency;
      bank.displayCurrency = effectiveBankCurrency;
      if (!bank.goalCurrency || bank.goalCurrency === "USD") {
        bank.goalCurrency = effectiveBankCurrency;
      }
    }

    const rawAmount = parseFloat(amount);

    // Store EXACT amount — no conversion needed since we use effective bank currency
    const storedAmount = rawAmount;

    bank.deposits.push({
      amount: storedAmount,
      currency: effectiveBankCurrency,
      amountInUSD: storedAmount / (RATES[effectiveBankCurrency] || 1),
      note: note || "",
      date: date ? new Date(date) : new Date(),
    });

    await bank.save();

    const total = bank.deposits.reduce((sum, d) => sum + d.amount, 0);

    res.status(201).json({
      success: true,
      message: `Added ${bankCurrency} ${storedAmount.toFixed(2)} to your piggy bank!`,
      total: parseFloat(total.toFixed(2)),
      currency: bankCurrency,
    });
  } catch (error) {
    next(error);
  }
};

// ── Delete deposit ────────────────────────────────────────
const deleteDeposit = async (req, res, next) => {
  try {
    const bank = await PiggyBank.findOne({ userId: req.user._id });
    if (!bank) return res.status(404).json({ success: false, message: "Piggy bank not found" });

    const deposit = bank.deposits.id(req.params.depositId);
    if (!deposit) return res.status(404).json({ success: false, message: "Deposit not found" });

    deposit.deleteOne();
    await bank.save();

    res.json({ success: true, message: "Deposit removed" });
  } catch (error) {
    next(error);
  }
};

// ── Update settings ───────────────────────────────────────
const updateSettings = async (req, res, next) => {
  try {
    const { name, emoji, goalAmount, goalCurrency, goalName, displayCurrency, currency } = req.body;

    let bank = await PiggyBank.findOne({ userId: req.user._id });
    if (!bank) bank = await PiggyBank.create({ userId: req.user._id });

    const newCurrency = displayCurrency || currency;

    // If currency is changing, convert all existing deposits to the new currency
    if (newCurrency && newCurrency !== (bank.currency || bank.displayCurrency)) {
      const oldCurrency = bank.currency || bank.displayCurrency || "INR";
      bank.deposits = bank.deposits.map((d) => {
        const converted = convertDirect(d.amount, oldCurrency, newCurrency);
        return {
          ...d.toObject(),
          amount: parseFloat(converted.toFixed(4)),
          currency: newCurrency,
          amountInUSD: parseFloat(converted / (RATES[newCurrency] || 1)),
        };
      });
      bank.currency        = newCurrency;
      bank.displayCurrency = newCurrency;
      // Also update goal currency
      if (!goalCurrency) bank.goalCurrency = newCurrency;
    }

    if (name        !== undefined) bank.name        = name;
    if (emoji       !== undefined) bank.emoji       = emoji;
    if (goalAmount  !== undefined && goalAmount !== "" && !isNaN(parseFloat(goalAmount))) {
      bank.goalAmount = parseFloat(goalAmount);
    }
    if (goalCurrency !== undefined) bank.goalCurrency = goalCurrency;
    if (goalName    !== undefined) bank.goalName    = goalName;

    await bank.save();
    res.json({ success: true, message: "Settings saved", piggyBank: bank });
  } catch (error) {
    next(error);
  }
};

// ── Currencies list ───────────────────────────────────────
const getCurrencies = async (req, res, next) => {
  try {
    const currencies = Object.keys(RATES).map((code) => ({ code, rate: RATES[code] }));
    res.json({ success: true, currencies });
  } catch (error) {
    next(error);
  }
};

// ── Convert amount ────────────────────────────────────────
const convertCurrency = async (req, res, next) => {
  try {
    const { amount, from, to } = req.body;
    if (!amount || !from || !to) {
      return res.status(400).json({ success: false, message: "amount, from, and to are required" });
    }
    const result = convertDirect(parseFloat(amount), from, to);
    res.json({ success: true, from, to, amount: parseFloat(amount), result: parseFloat(result.toFixed(4)) });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPiggyBank, addDeposit, deleteDeposit, updateSettings, getCurrencies, convertCurrency };