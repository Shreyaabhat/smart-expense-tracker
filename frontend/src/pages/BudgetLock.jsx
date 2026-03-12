import { useState, useEffect } from "react";

const SYMBOL = { USD:"$",EUR:"€",GBP:"£",INR:"₹",CAD:"CA$",AUD:"A$",JPY:"¥",SGD:"S$",AED:"AED",CHF:"CHF",MXN:"MX$",BRL:"R$",KRW:"₩",CNY:"¥" };
const CATEGORIES = ["Food & Dining","Transportation","Shopping","Entertainment","Health & Medical","Housing","Utilities","Education","Travel","Personal Care","Subscriptions","Other"];

const BudgetLock = () => {
  const [budgets,  setBudgets]  = useState([]);
  const [spending, setSpending] = useState({});
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error,    setError]    = useState("");
  const [form,     setForm]     = useState({ category: CATEGORIES[0], limit: "", alertThreshold: 80 });

  const cur = localStorage.getItem("preferredCurrency") || "INR";
  const sym = SYMBOL[cur] || cur;
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
  const BASE = "/api";

  useEffect(() => {
    Promise.all([
      fetch(`${BASE}/budgets`, { headers }).then(r => r.json()),
      fetch(`${BASE}/expenses/data/analytics`, { headers }).then(r => r.json()),
    ]).then(([b, a]) => {
      setBudgets(b.budgets || []);
      const map = {};
      (a.analytics?.categoryBreakdown || []).forEach(c => { map[c._id] = c.total; });
      setSpending(map);
    }).catch(e => setError("Load failed: " + e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = () => {
    if (!form.limit || parseFloat(form.limit) <= 0) { setError("Enter a valid limit"); return; }
    setSaving(true); setError("");
    fetch(`${BASE}/budgets`, {
      method: "POST", headers,
      body: JSON.stringify({ category: form.category, limit: parseFloat(form.limit), alertThreshold: parseInt(form.alertThreshold), period: "monthly" }),
    }).then(r => r.json()).then(() =>
      fetch(`${BASE}/budgets`, { headers }).then(r => r.json()).then(b => {
        setBudgets(b.budgets || []);
        setShowForm(false);
        setForm({ category: CATEGORIES[0], limit: "", alertThreshold: 80 });
      })
    ).catch(e => setError(e.message))
     .finally(() => setSaving(false));
  };

  const handleDelete = (id) => {
    fetch(`${BASE}/budgets/${id}`, { method: "DELETE", headers })
      .then(() => setBudgets(prev => prev.filter(b => b._id !== id)))
      .catch(() => setError("Delete failed"));
  };

  const enriched = budgets.map(b => {
    const limit = parseFloat(b.limit) || 0;
    const spent = parseFloat(spending[b.category]) || 0;
    const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
    const remaining = limit - spent;
    const status = spent > limit ? "exceeded" : pct >= (b.alertThreshold || 80) ? "warning" : "ok";
    return { ...b, limit, spent, pct, remaining, status };
  });

  if (loading) return <div style={{padding:40,color:"#aaa",textAlign:"center"}}>Loading...</div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-100">Budget Lock 🔒</h1>
          <p className="text-sm text-gray-400">Set monthly spending limits per category</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          + Add Budget
        </button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">{error}</div>}

      {showForm && (
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-100 mb-4">New Budget Lock</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Monthly Limit ({sym})</label>
              <input type="number" className="input font-mono" placeholder="e.g. 6000"
                value={form.limit} min="1"
                onChange={e => setForm(f => ({ ...f, limit: e.target.value }))} />
            </div>
            <div>
              <label className="label">Alert at {form.alertThreshold}% spent</label>
              <input type="range" min="10" max="100" step="5" value={form.alertThreshold}
                onChange={e => setForm(f => ({ ...f, alertThreshold: e.target.value }))}
                className="w-full accent-brand-500" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10%</span><span>50%</span><span>100%</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving ? "Saving..." : "🔒 Lock Budget"}
              </button>
            </div>
          </div>
        </div>
      )}

      {enriched.length === 0 && !showForm && (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-3">🔒</p>
          <p className="text-gray-400 font-medium">No budgets set yet</p>
          <p className="text-sm text-gray-500 mt-1">Click "Add Budget" to lock a spending limit</p>
        </div>
      )}

      {enriched.map(b => {
        const bar = b.status === "exceeded" ? "#ef4444" : b.status === "warning" ? "#eab308" : "#22c55e";
        const tc  = b.status === "exceeded" ? "text-red-400" : b.status === "warning" ? "text-yellow-400" : "text-green-400";
        return (
          <div key={b._id} className={`card p-5 border ${b.status === "exceeded" ? "border-red-500/40" : b.status === "warning" ? "border-yellow-500/40" : "border-surface-600"}`}>
            
            {/* exceeded banner */}
            {b.status === "exceeded" && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 mb-3 text-sm text-red-400 font-semibold">
                ⚠ Budget exceeded
              </div>
            )}

            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-100">{b.category}</span>
              <button onClick={() => handleDelete(b._id)} className="text-gray-500 hover:text-red-400 text-sm transition-colors">✕</button>
            </div>

            {/* budget line like the example */}
            <div className="text-xs text-gray-400 mb-3 space-y-0.5">
              <p>{b.category} Budget: <span className="text-gray-200 font-mono">{sym}{(parseFloat(b.limit)||0).toFixed(0)}</span></p>
              <p>Spent: <span className={`font-mono font-semibold ${tc}`}>{sym}{(parseFloat(b.spent)||0).toFixed(0)}</span></p>
              {b.status !== "exceeded" && (
                <p>Alert: <span className="text-yellow-400 font-mono">{sym}{(parseFloat(b.remaining)||0).toFixed(0)} remaining</span></p>
              )}
              {b.status === "exceeded" && (
                <p>Over by: <span className="text-red-400 font-mono">{sym}{Math.abs(parseFloat(b.remaining)||0).toFixed(0)}</span></p>
              )}
            </div>

            {/* progress bar */}
            <div className="h-2.5 bg-surface-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, b.pct)}%`, backgroundColor: bar }} />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{b.pct}% used</span>
              <span>Alert @ {b.alertThreshold}%</span>
            </div>
          </div>
        );
      })}

      {enriched.length > 0 && (
        <div className="card p-5 grid grid-cols-3 gap-4 text-center">
          <div><p className="text-2xl font-bold text-green-400">{enriched.filter(b => b.status === "ok").length}</p><p className="text-xs text-gray-500">On Track</p></div>
          <div><p className="text-2xl font-bold text-yellow-400">{enriched.filter(b => b.status === "warning").length}</p><p className="text-xs text-gray-500">Near Limit</p></div>
          <div><p className="text-2xl font-bold text-red-400">{enriched.filter(b => b.status === "exceeded").length}</p><p className="text-xs text-gray-500">Exceeded</p></div>
        </div>
      )}
    </div>
  );
};

export default BudgetLock;