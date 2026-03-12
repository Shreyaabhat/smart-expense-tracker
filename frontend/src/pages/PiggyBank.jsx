// ============================================
// Piggy Bank Page - Complete Rewrite
// Saves and displays in the currency YOU choose
// ============================================

import { useState, useEffect, useCallback } from "react";
import { Trash2, Plus, Target, Settings, X, Check } from "lucide-react";
import { piggyBankAPI } from "../services/api";
import { formatDate } from "../utils/helpers";
import LoadingSpinner from "../components/common/LoadingSpinner";

// ── Currency config ───────────────────────────────────────
const CURRENCIES = [
  { code: "USD", symbol: "$",   name: "US Dollar",         flag: "🇺🇸" },
  { code: "EUR", symbol: "€",   name: "Euro",              flag: "🇪🇺" },
  { code: "GBP", symbol: "£",   name: "British Pound",     flag: "🇬🇧" },
  { code: "INR", symbol: "₹",   name: "Indian Rupee",      flag: "🇮🇳" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar",   flag: "🇨🇦" },
  { code: "AUD", symbol: "A$",  name: "Australian Dollar", flag: "🇦🇺" },
  { code: "JPY", symbol: "¥",   name: "Japanese Yen",      flag: "🇯🇵" },
  { code: "SGD", symbol: "S$",  name: "Singapore Dollar",  flag: "🇸🇬" },
  { code: "AED", symbol: "AED", name: "UAE Dirham",        flag: "🇦🇪" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc",       flag: "🇨🇭" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso",      flag: "🇲🇽" },
  { code: "BRL", symbol: "R$",  name: "Brazilian Real",    flag: "🇧🇷" },
  { code: "KRW", symbol: "₩",   name: "South Korean Won",  flag: "🇰🇷" },
  { code: "CNY", symbol: "¥",   name: "Chinese Yuan",      flag: "🇨🇳" },
];

// Exchange rates vs USD
const RATES = {
  USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.5,  CAD: 1.36,
  AUD: 1.53, JPY: 149.5, SGD: 1.34, AED: 3.67, CHF: 0.89,
  MXN: 17.1, BRL: 4.97,  KRW: 1325, CNY: 7.24,
};

const getCurrency     = (code) => CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
const getSymbol       = (code) => getCurrency(code).symbol;
const convertFromUSD  = (usd, to)   => usd  * (RATES[to]   || 1);
const toUSD           = (amt, from) => amt  / (RATES[from]  || 1);

const EMOJIS = ["🐷","💰","🪙","💎","🏦","⭐","🎯","🌟","🔐","💝"];

// ── Deposit Form ──────────────────────────────────────────
const DepositForm = ({ onAdd, loading, defaultCurrency }) => {
  const [form, setForm] = useState({
    amount: "", currency: defaultCurrency || "USD",
    note: "", date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    setForm((f) => ({ ...f, currency: defaultCurrency || "USD" }));
  }, [defaultCurrency]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) return;
    onAdd({ ...form, amount: parseFloat(form.amount) });
    setForm((f) => ({ ...f, amount: "", note: "" }));
  };

  const cur = getCurrency(form.currency);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Currency &amp; Amount</label>
        <div className="flex gap-2">
          <select
            value={form.currency}
            onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
            className="input w-40 flex-shrink-0"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
            ))}
          </select>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm pointer-events-none">
              {cur.symbol}
            </span>
            <input
              type="number" value={form.amount} min="0.01" step="0.01" required
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="0.00"
              className="input font-mono text-lg pl-8"
            />
          </div>
        </div>
        {form.amount && parseFloat(form.amount) > 0 && form.currency !== "USD" && (
          <p className="text-xs text-gray-500 mt-1 ml-1">
            ≈ ${toUSD(parseFloat(form.amount), form.currency).toFixed(2)} USD
          </p>
        )}
      </div>

      <div>
        <label className="label">Date</label>
        <input type="date" value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          className="input" />
      </div>

      <div>
        <label className="label">Note (optional)</label>
        <input type="text" value={form.note} maxLength={200}
          onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
          placeholder="e.g. Birthday money, coin jar..."
          className="input" />
      </div>

      <button type="submit" disabled={loading || !form.amount}
        className="btn-primary w-full py-3 text-base disabled:opacity-50 flex items-center justify-center gap-2">
        {loading ? <LoadingSpinner size="sm" /> : <><Plus className="w-4 h-4" />Add to Piggy Bank</>}
      </button>
    </form>
  );
};

// ── Settings Modal ────────────────────────────────────────
const SettingsModal = ({ bank, onSave, onClose }) => {
  const [form, setForm] = useState({
    name:            bank?.name            || "My Piggy Bank",
    emoji:           bank?.emoji           || "🐷",
    displayCurrency: bank?.displayCurrency || "USD",
    goalAmount:      bank?.goalAmount      || "",
    goalCurrency:    bank?.goalCurrency    || "USD",
    goalName:        bank?.goalName        || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-100">Settings</h2>
          <button onClick={onClose} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input value={form.name} maxLength={50}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="input" />
          </div>

          <div>
            <label className="label">Icon</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((em) => (
                <button key={em} type="button"
                  onClick={() => setForm((f) => ({ ...f, emoji: em }))}
                  className={`text-2xl p-2 rounded-xl transition-all ${
                    form.emoji === em
                      ? "bg-brand-500/20 border border-brand-500/50 scale-110"
                      : "bg-surface-700 hover:bg-surface-600"
                  }`}>
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* ★ THE KEY SETTING ★ */}
          <div>
            <label className="label">Display Currency</label>
            <select value={form.displayCurrency}
              onChange={(e) => setForm((f) => ({ ...f, displayCurrency: e.target.value }))}
              className="input">
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.symbol} {c.code} — {c.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Your total savings will be shown in this currency.
            </p>
          </div>

          <div>
            <label className="label">Savings Goal (optional)</label>
            <input value={form.goalName} maxLength={100}
              onChange={(e) => setForm((f) => ({ ...f, goalName: e.target.value }))}
              placeholder="e.g. New laptop, Vacation..."
              className="input mb-2" />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" min="0" value={form.goalAmount}
                onChange={(e) => setForm((f) => ({ ...f, goalAmount: e.target.value }))}
                placeholder="Goal amount" className="input" />
              <select value={form.goalCurrency}
                onChange={(e) => setForm((f) => ({ ...f, goalCurrency: e.target.value }))}
                className="input">
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving ? <LoadingSpinner size="sm" /> : <><Check className="w-4 h-4" />Save</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────
const PiggyBankPage = () => {
  const [bank,          setBank]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [addLoading,    setAddLoading]    = useState(false);
  const [showSettings,  setShowSettings]  = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [successMsg,    setSuccessMsg]    = useState("");
  const [error,         setError]         = useState("");

  const fetchBank = useCallback(async () => {
    try {
      const res = await piggyBankAPI.get();
      setBank(res.data.piggyBank);
    } catch {
      setError("Failed to load piggy bank");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBank(); }, [fetchBank]);

  const handleAddDeposit = async (form) => {
    setAddLoading(true);
    setError("");
    try {
      await piggyBankAPI.addDeposit(form);
      setSuccessMsg(`✅ Added ${getSymbol(form.currency)}${form.amount} to your piggy bank!`);
      setTimeout(() => setSuccessMsg(""), 3000);
      await fetchBank();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add deposit");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (depositId) => {
    try {
      await piggyBankAPI.deleteDeposit(depositId);
      setDeleteConfirm(null);
      await fetchBank();
    } catch {
      setError("Failed to remove deposit");
    }
  };

  const handleSaveSettings = async (form) => {
    try {
      await piggyBankAPI.updateSettings(form);
      await fetchBank();
    } catch {
      setError("Failed to save settings");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" text="Loading your piggy bank..." />
    </div>
  );

  // ── Derive display values ──
  const displayCurrency = bank?.displayCurrency || "USD";
  const displayCur      = getCurrency(displayCurrency);

  // For total: if all deposits are in display currency, sum originals exactly (no rounding)
  // Otherwise convert via USD
  const totalDisplay = (() => {
    const deposits = bank?.deposits || [];
    if (deposits.length === 0) return 0;
    const allMatch = deposits.every(d => (d.currency || "USD") === displayCurrency);
    if (allMatch) {
      return deposits.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    }
    return convertFromUSD(bank?.totalSavedUSD || 0, displayCurrency);
  })();

  const totalUSD = bank?.totalSavedUSD || 0;

  const hasGoal  = bank?.goalAmount > 0;
  const goalUSD  = hasGoal ? toUSD(bank.goalAmount, bank.goalCurrency) : 0;
  const progress = hasGoal ? Math.min(100, Math.round((totalDisplay / bank.goalAmount) * 100)) : 0;

  const fmt = (num, cur) =>
    `${getSymbol(cur)}${parseFloat(num || 0).toFixed(2)}`;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{bank?.emoji || "🐷"}</span>
          <div>
            <h1 className="text-xl font-semibold text-gray-100">{bank?.name || "My Piggy Bank"}</h1>
            <p className="text-sm text-gray-400">
              {displayCur.flag} Showing in {displayCurrency} · physical savings tracker
            </p>
          </div>
        </div>
        <button onClick={() => setShowSettings(true)}
          className="btn-ghost flex items-center gap-2 text-sm">
          <Settings className="w-4 h-4" /> Settings
        </button>
      </div>

      {successMsg && (
        <div className="bg-brand-500/10 border border-brand-500/30 rounded-xl p-4 text-sm text-brand-400">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Total Saved */}
      <div className="card p-6 text-center">
        <p className="text-sm text-gray-400 mb-1">Total Saved</p>

        <p className="text-5xl font-bold font-mono text-brand-400 mb-1">
          {fmt(totalDisplay, displayCurrency)}
        </p>

        <p className="text-sm text-gray-500">
          {displayCurrency} · {bank?.depositCount || 0} deposit{bank?.depositCount !== 1 ? "s" : ""}
        </p>

        {displayCurrency !== "USD" && totalUSD > 0 && (
          <p className="text-xs text-gray-600 mt-1">≈ ${totalUSD.toFixed(2)} USD</p>
        )}

        {displayCurrency === "USD" && (
          <button onClick={() => setShowSettings(true)}
            className="text-xs text-brand-500 hover:text-brand-400 mt-2 underline underline-offset-2">
            Tap Settings to change display currency →
          </button>
        )}

        {hasGoal && (
          <div className="mt-6 text-left">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-brand-400" />
                <span className="text-sm text-gray-300">{bank.goalName || "Savings Goal"}</span>
              </div>
              <span className="text-sm font-semibold text-brand-400">{progress}%</span>
            </div>
            <div className="h-3 bg-surface-600 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between mt-1.5 text-xs text-gray-500">
              <span>{fmt(totalDisplay, displayCurrency)} saved</span>
              <span>Goal: {fmt(bank.goalAmount, bank.goalCurrency)}</span>
            </div>
            {progress >= 100 && (
              <p className="text-center text-brand-400 font-semibold mt-2">🎉 Goal reached!</p>
            )}
          </div>
        )}
      </div>

      {/* Add Deposit */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-gray-100 mb-4">Add Money to Piggy Bank</h2>
        <DepositForm onAdd={handleAddDeposit} loading={addLoading} defaultCurrency={displayCurrency} />
      </div>

      {/* History */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-gray-100 mb-4">Deposit History</h2>
        {!bank?.deposits?.length ? (
          <div className="py-12 text-center text-sm text-gray-500">
            No deposits yet. Add your first one above! 🐷
          </div>
        ) : (
          <div className="divide-y divide-surface-600">
            {bank.deposits.map((deposit) => {
              const isMatch = deposit.currency === displayCurrency;
              // If same currency → show exact stored amount (no math, no rounding errors)
              // If different → convert via USD
              const inDisplay = isMatch
                ? parseFloat(deposit.amount)
                : convertFromUSD(deposit.amountInUSD, displayCurrency);
              return (
                <div key={deposit._id} className="flex items-center justify-between py-3 group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface-700 border border-surface-500 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-base leading-none">{getCurrency(deposit.currency).flag}</span>
                      <span className="text-[9px] text-gray-500 leading-none mt-0.5">{deposit.currency}</span>
                    </div>
                    <div>
                      {/* Primary: display currency */}
                      <p className="text-sm font-semibold text-gray-100 font-mono">
                        {fmt(inDisplay, displayCurrency)}
                      </p>
                      {/* Secondary: original if different */}
                      {!isMatch && (
                        <p className="text-xs text-gray-500">
                          Originally {fmt(deposit.amount, deposit.currency)}
                        </p>
                      )}
                      {deposit.note && (
                        <p className="text-xs text-gray-500 mt-0.5">📝 {deposit.note}</p>
                      )}
                      <p className="text-xs text-gray-600">
                        {formatDate(deposit.date, "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setDeleteConfirm(deposit._id)}
                    className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showSettings && (
        <SettingsModal bank={bank} onSave={handleSaveSettings} onClose={() => setShowSettings(false)} />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-sm">
            <h3 className="text-base font-semibold text-gray-100 mb-2">Remove Deposit?</h3>
            <p className="text-sm text-gray-400 mb-5">This will reduce your piggy bank total.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 py-2 px-4 rounded-xl text-sm font-medium">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PiggyBankPage;