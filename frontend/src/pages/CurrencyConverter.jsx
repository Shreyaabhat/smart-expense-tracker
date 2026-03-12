// ============================================
// Currency Converter Page
// ============================================

import { useState } from "react";
import { ArrowLeftRight, RefreshCw } from "lucide-react";
import { piggyBankAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", flag: "🇨🇳" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "AED", symbol: "AED", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso", flag: "🇲🇽" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", flag: "🇧🇷" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", flag: "🇭🇰" },
  { code: "KRW", symbol: "₩", name: "South Korean Won", flag: "🇰🇷" },
];

// Common quick-convert pairs
const QUICK_PAIRS = [
  { from: "USD", to: "INR" },
  { from: "USD", to: "EUR" },
  { from: "GBP", to: "USD" },
  { from: "EUR", to: "INR" },
  { from: "USD", to: "AUD" },
  { from: "USD", to: "CAD" },
];

const getCurrency = (code) => CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];

const CurrencyConverter = () => {
  const [amount, setAmount] = useState("1");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("INR");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConvert = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await piggyBankAPI.convert({ amount: parseFloat(amount), from, to });
      setResult(res.data);
    } catch (err) {
      // Fallback: calculate client-side using hardcoded rates
      const RATES = {
        USD:1, EUR:0.92, GBP:0.79, INR:83.5, CAD:1.36, AUD:1.53,
        JPY:149.5, CNY:7.24, SGD:1.34, CHF:0.89, AED:3.67,
        MXN:17.1, BRL:4.97, HKD:7.82, KRW:1325,
      };
      const inUSD = parseFloat(amount) / (RATES[from] || 1);
      const converted = inUSD * (RATES[to] || 1);
      setResult({
        from, to, amount: parseFloat(amount),
        result: parseFloat(converted.toFixed(4)),
        fromSymbol: getCurrency(from).symbol,
        toSymbol: getCurrency(to).symbol,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
    setResult(null);
  };

  const handleQuickPair = (pair) => {
    setFrom(pair.from);
    setTo(pair.to);
    setResult(null);
  };

  const fromCurrency = getCurrency(from);
  const toCurrency = getCurrency(to);

  return (
    <div className="space-y-6 animate-fade-in max-w-xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-gray-100">Currency Converter</h1>
        <p className="text-sm text-gray-400 mt-0.5">Convert between 15 world currencies</p>
      </div>

      {/* Main converter card */}
      <div className="card p-6 space-y-5">

        {/* Amount input */}
        <div>
          <label className="label">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setResult(null); }}
            placeholder="Enter amount"
            min="0.01"
            step="any"
            className="input font-mono text-2xl py-4"
          />
        </div>

        {/* From / Swap / To */}
        <div className="flex items-center gap-3">
          {/* From */}
          <div className="flex-1">
            <label className="label">From</label>
            <select
              value={from}
              onChange={(e) => { setFrom(e.target.value); setResult(null); }}
              className="input"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Swap button */}
          <div className="pt-5">
            <button
              onClick={handleSwap}
              className="w-10 h-10 bg-surface-700 hover:bg-surface-600 border border-surface-500 rounded-xl flex items-center justify-center transition-all hover:rotate-180 duration-300"
            >
              <ArrowLeftRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* To */}
          <div className="flex-1">
            <label className="label">To</label>
            <select
              value={to}
              onChange={(e) => { setTo(e.target.value); setResult(null); }}
              className="input"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Convert button */}
        <button
          onClick={handleConvert}
          disabled={loading || !amount}
          className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading
            ? <LoadingSpinner size="sm" />
            : <><RefreshCw className="w-4 h-4" /> Convert</>}
        </button>

        {/* Result */}
        {result && (
          <div className="bg-brand-500/5 border border-brand-500/20 rounded-2xl p-6 text-center animate-fade-in">
            <p className="text-sm text-gray-400 mb-1">
              {fromCurrency.flag} {result.amount} {from} =
            </p>
            <p className="text-4xl font-bold font-mono text-brand-400">
              {result.toSymbol}{result.result.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">{toCurrency.flag} {to} — {toCurrency.name}</p>
            <p className="text-xs text-gray-600 mt-3">
              1 {from} = {result.toSymbol}{(result.result / result.amount).toFixed(4)} {to}
            </p>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400 text-center">{error}</p>
        )}
      </div>

      {/* Quick pairs */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-gray-100 mb-3">Quick Convert</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {QUICK_PAIRS.map((pair) => (
            <button
              key={`${pair.from}-${pair.to}`}
              onClick={() => handleQuickPair(pair)}
              className={`px-3 py-2.5 rounded-xl text-sm border transition-all ${
                from === pair.from && to === pair.to
                  ? "bg-brand-500/10 border-brand-500/30 text-brand-400"
                  : "bg-surface-700 border-surface-600 text-gray-400 hover:text-gray-100 hover:border-surface-500"
              }`}
            >
              {getCurrency(pair.from).flag} {pair.from} → {getCurrency(pair.to).flag} {pair.to}
            </button>
          ))}
        </div>
      </div>

      {/* Rate table */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-gray-100 mb-3">
          All Rates vs {from}
        </h2>
        <div className="divide-y divide-surface-600">
          {CURRENCIES.filter((c) => c.code !== from).map((c) => {
            const RATES = {
              USD:1, EUR:0.92, GBP:0.79, INR:83.5, CAD:1.36, AUD:1.53,
              JPY:149.5, CNY:7.24, SGD:1.34, CHF:0.89, AED:3.67,
              MXN:17.1, BRL:4.97, HKD:7.82, KRW:1325,
            };
            const inUSD = 1 / (RATES[from] || 1);
            const converted = inUSD * (RATES[c.code] || 1);
            return (
              <div key={c.code} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{c.flag}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-100">{c.code}</p>
                    <p className="text-xs text-gray-500">{c.name}</p>
                  </div>
                </div>
                <p className="text-sm font-mono text-gray-200">
                  {c.symbol}{converted < 0.01
                    ? converted.toFixed(6)
                    : converted < 1
                    ? converted.toFixed(4)
                    : converted.toFixed(2)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;