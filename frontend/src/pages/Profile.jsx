// ============================================
// Profile Settings Page
// Change name, currency, theme
// ============================================

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import { Check, User } from "lucide-react";
import LoadingSpinner from "../components/common/LoadingSpinner";

const CURRENCIES = [
  { code: "USD", symbol: "$",   name: "US Dollar",         flag: "🇺🇸" },
  { code: "EUR", symbol: "€",   name: "Euro",              flag: "🇪🇺" },
  { code: "GBP", symbol: "£",   name: "British Pound",     flag: "🇬🇧" },
  { code: "INR", symbol: "₹",   name: "Indian Rupee",      flag: "🇮🇳" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar",   flag: "🇨🇦" },
  { code: "AUD", symbol: "A$",  name: "Australian Dollar", flag: "🇦🇺" },
];

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    name:     user?.name     || "",
    currency: user?.currency || "USD",
  });
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await authAPI.updateProfile(form);
      // Only update name and currency — don't overwrite the whole user object
      // (which would wipe token and other fields)
      updateUser({ name: res.data.user.name, currency: res.data.user.currency });
      localStorage.setItem("preferredCurrency", form.currency);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center justify-center">
          <User className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-100">Profile Settings</h1>
          <p className="text-sm text-gray-400">Manage your account preferences</p>
        </div>
      </div>

      {success && (
        <div className="bg-brand-500/10 border border-brand-500/30 rounded-xl p-4 text-sm text-brand-400 flex items-center gap-2">
          <Check className="w-4 h-4" /> Settings saved successfully!
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="card p-6 space-y-5">
        {/* Name */}
        <div>
          <label className="label">Full Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="input"
            maxLength={50}
          />
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="label">Email</label>
          <input value={user?.email || ""} disabled className="input opacity-50 cursor-not-allowed" />
        </div>

        {/* ★ Currency picker ★ */}
        <div>
          <label className="label">Default Currency</label>
          <p className="text-xs text-gray-500 mb-2">
            All expenses and the dashboard will show amounts in this currency.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  setForm((f) => ({ ...f, currency: c.code }));
                  localStorage.setItem("preferredCurrency", c.code);
                }}
                className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-all ${
                  form.currency === c.code
                    ? "bg-brand-500/15 border-brand-500/50 text-brand-300"
                    : "bg-surface-700 border-surface-500 text-gray-300 hover:border-surface-400"
                }`}
              >
                <span className="text-xl">{c.flag}</span>
                <div className="text-left">
                  <p className="font-semibold text-xs">{c.code}</p>
                  <p className="text-[10px] text-gray-500">{c.symbol}</p>
                </div>
                {form.currency === c.code && (
                  <Check className="w-3.5 h-3.5 ml-auto text-brand-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2"
        >
          {saving ? <LoadingSpinner size="sm" /> : <><Check className="w-4 h-4" /> Save Changes</>}
        </button>
      </div>
    </div>
  );
};

export default Profile;