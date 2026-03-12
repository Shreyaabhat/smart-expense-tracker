// ============================================
// Currency Utility
// Hardcoded rates (updated periodically)
// Falls back gracefully if API is unavailable
// ============================================

// Approximate rates relative to USD (1 USD = X currency)
const RATES_TO_USD = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.5,
  CAD: 1.36,
  AUD: 1.53,
  JPY: 149.5,
  CNY: 7.24,
  MXN: 17.1,
  BRL: 4.97,
  SGD: 1.34,
  CHF: 0.89,
  HKD: 7.82,
  KRW: 1325,
  AED: 3.67,
};

const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  CAD: "CA$",
  AUD: "A$",
  JPY: "¥",
  CNY: "¥",
  MXN: "MX$",
  BRL: "R$",
  SGD: "S$",
  CHF: "CHF",
  HKD: "HK$",
  KRW: "₩",
  AED: "AED",
};

const CURRENCY_NAMES = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  INR: "Indian Rupee",
  CAD: "Canadian Dollar",
  AUD: "Australian Dollar",
  JPY: "Japanese Yen",
  CNY: "Chinese Yuan",
  MXN: "Mexican Peso",
  BRL: "Brazilian Real",
  SGD: "Singapore Dollar",
  CHF: "Swiss Franc",
  HKD: "Hong Kong Dollar",
  KRW: "South Korean Won",
  AED: "UAE Dirham",
};

/**
 * Convert amount from one currency to another
 * @param {number} amount
 * @param {string} fromCurrency
 * @param {string} toCurrency
 * @returns {number}
 */
const convert = (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return amount;

  const fromRate = RATES_TO_USD[fromCurrency] || 1;
  const toRate = RATES_TO_USD[toCurrency] || 1;

  // Convert to USD first, then to target currency
  const inUSD = amount / fromRate;
  return inUSD * toRate;
};

/**
 * Convert any amount to USD
 */
const toUSD = (amount, fromCurrency) => {
  const rate = RATES_TO_USD[fromCurrency] || 1;
  return amount / rate;
};

/**
 * Get symbol for a currency code
 */
const getSymbol = (currency) => CURRENCY_SYMBOLS[currency] || currency;

/**
 * Get all supported currencies as array
 */
const getSupportedCurrencies = () => {
  return Object.keys(RATES_TO_USD).map((code) => ({
    code,
    name: CURRENCY_NAMES[code] || code,
    symbol: CURRENCY_SYMBOLS[code] || code,
    rate: RATES_TO_USD[code],
  }));
};

module.exports = { convert, toUSD, getSymbol, getSupportedCurrencies, RATES_TO_USD, CURRENCY_SYMBOLS };