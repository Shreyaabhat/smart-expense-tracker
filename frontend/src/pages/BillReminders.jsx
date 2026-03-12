import { useState, useEffect } from "react";

const BILL_SUGGESTIONS = [
  "Electricity Bill","Internet Bill","Rent","Water Bill","Gas Bill",
  "Phone Bill","Credit Card","Netflix","Spotify","Insurance",
  "EMI","Gym Membership","OTT Subscription","Other",
];

const SYMBOL = { USD:"$",EUR:"€",GBP:"£",INR:"₹",CAD:"CA$",AUD:"A$",JPY:"¥",SGD:"S$",AED:"AED",CHF:"CHF",MXN:"MX$",BRL:"R$",KRW:"₩",CNY:"¥" };

const BillReminders = () => {
  const [bills,    setBills]    = useState(() => {
    try { return JSON.parse(localStorage.getItem("billReminders") || "[]"); } catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState({ name: "", amount: "", dueDay: "", notes: "" });
  const [error,    setError]    = useState("");

  const cur = localStorage.getItem("preferredCurrency") || "INR";
  const sym = SYMBOL[cur] || cur;

  // Save to localStorage whenever bills change
  useEffect(() => {
    localStorage.setItem("billReminders", JSON.stringify(bills));
  }, [bills]);

  const getDaysUntil = (dueDay) => {
    const today = new Date();
    const due = new Date(today.getFullYear(), today.getMonth(), parseInt(dueDay));
    if (due < today) due.setMonth(due.getMonth() + 1);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getStatus = (daysUntil) => {
    if (daysUntil < 0)  return "overdue";
    if (daysUntil <= 3) return "urgent";
    if (daysUntil <= 7) return "upcoming";
    return "ok";
  };

  const handleAdd = () => {
    if (!form.name.trim())       { setError("Enter bill name"); return; }
    if (!form.dueDay || parseInt(form.dueDay) < 1 || parseInt(form.dueDay) > 31) {
      setError("Enter a valid due day (1-31)"); return;
    }
    const newBill = {
      id: Date.now(),
      name: form.name.trim(),
      amount: form.amount ? parseFloat(form.amount) : null,
      dueDay: parseInt(form.dueDay),
      notes: form.notes.trim(),
    };
    setBills(prev => [...prev, newBill]);
    setForm({ name: "", amount: "", dueDay: "", notes: "" });
    setShowForm(false);
    setError("");
  };

  const handleDelete = (id) => {
    setBills(prev => prev.filter(b => b.id !== id));
  };

  const enriched = bills.map(b => {
    const daysUntil = getDaysUntil(b.dueDay);
    const status    = getStatus(daysUntil);
    return { ...b, daysUntil, status };
  }).sort((a, b) => a.daysUntil - b.daysUntil);

  const overdue  = enriched.filter(b => b.status === "overdue");
  const urgent   = enriched.filter(b => b.status === "urgent");

  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-100">Bill Reminders 🔔</h1>
          <p className="text-sm text-gray-400">Never miss a payment</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          + Add Bill
        </button>
      </div>

      {/* Urgent banners */}
      {overdue.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-4">
          <p className="text-sm font-semibold text-red-400 mb-1">⚠ Overdue Bills!</p>
          {overdue.map(b => (
            <p key={b.id} className="text-xs text-red-300">• {b.name} was due on day {b.dueDay}</p>
          ))}
        </div>
      )}
      {urgent.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/40 rounded-xl p-4">
          <p className="text-sm font-semibold text-yellow-400 mb-1">⚠ Due Soon</p>
          {urgent.map(b => (
            <p key={b.id} className="text-xs text-yellow-300">
              • {b.name} due in {b.daysUntil === 0 ? "today!" : `${b.daysUntil} day${b.daysUntil !== 1 ? "s" : ""}`}
            </p>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">{error}</div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-100 mb-4">New Bill Reminder</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Bill Name</label>
              <input list="bill-suggestions" className="input" placeholder="e.g. Electricity Bill"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <datalist id="bill-suggestions">
                {BILL_SUGGESTIONS.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>
            <div>
              <label className="label">Amount ({sym}) — optional</label>
              <input type="number" className="input font-mono" placeholder="e.g. 1200"
                value={form.amount} min="0"
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div>
              <label className="label">Due Day of Month (1–31)</label>
              <input type="number" className="input" placeholder="e.g. 5 for every 5th of the month"
                value={form.dueDay} min="1" max="31"
                onChange={e => setForm(f => ({ ...f, dueDay: e.target.value }))} />
            </div>
            <div>
              <label className="label">Notes — optional</label>
              <input className="input" placeholder="e.g. Auto-debit from SBI"
                value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowForm(false); setError(""); }} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleAdd} className="btn-primary flex-1">🔔 Add Reminder</button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {enriched.length === 0 && !showForm && (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-3">🔔</p>
          <p className="text-gray-400 font-medium">No bill reminders yet</p>
          <p className="text-sm text-gray-500 mt-1">Add your recurring bills to get reminders</p>
        </div>
      )}

      {/* Bill cards */}
      {enriched.map(b => {
        const borderColor = b.status === "overdue"  ? "border-red-500/40"
                          : b.status === "urgent"   ? "border-yellow-500/40"
                          : b.status === "upcoming" ? "border-brand-500/30"
                          : "border-surface-600";
        const badgeColor  = b.status === "overdue"  ? "bg-red-500/20 text-red-400"
                          : b.status === "urgent"   ? "bg-yellow-500/20 text-yellow-400"
                          : b.status === "upcoming" ? "bg-brand-500/20 text-brand-400"
                          : "bg-green-500/20 text-green-400";
        const badgeText   = b.status === "overdue"  ? "⚠ Overdue"
                          : b.status === "urgent"   ? `⚠ Due in ${b.daysUntil === 0 ? "today" : b.daysUntil + " day" + (b.daysUntil !== 1 ? "s" : "")}`
                          : b.status === "upcoming" ? `Due in ${b.daysUntil} days`
                          : `Due in ${b.daysUntil} days`;

        return (
          <div key={b.id} className={`card p-5 border ${borderColor}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-100">{b.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${badgeColor}`}>{badgeText}</span>
                </div>
                <p className="text-xs text-gray-500">
                  Due every <span className="text-gray-300">day {b.dueDay}</span> of the month
                  {b.amount ? <> · <span className="text-brand-400 font-mono">{sym}{b.amount}</span></> : ""}
                </p>
                {b.notes && <p className="text-xs text-gray-500 mt-1">📝 {b.notes}</p>}
              </div>
              <button onClick={() => handleDelete(b.id)} className="text-gray-500 hover:text-red-400 transition-colors ml-3">✕</button>
            </div>
          </div>
        );
      })}

      {/* Summary */}
      {enriched.length > 0 && (
        <div className="card p-5 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-red-400">{overdue.length}</p>
            <p className="text-xs text-gray-500">Overdue</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-400">{urgent.length}</p>
            <p className="text-xs text-gray-500">Due Soon</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">{enriched.filter(b => b.status === "ok" || b.status === "upcoming").length}</p>
            <p className="text-xs text-gray-500">On Track</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillReminders;