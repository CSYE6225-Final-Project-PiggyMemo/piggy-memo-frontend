"use client";
import { useEffect, useState } from "react";
import { fetchBudget, setBudget, removeBudget } from "@/api/budget";
import styles from "@/components/animations.module.css";

function formatCurrency(n) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 2,
  }).format(n);
}

function formatDate(str) {
  if (!str) return "—";
  const d = new Date(str + "T00:00:00");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

/* ── Stat card ─────────────────────────────────────────────────────────── */
function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-rose-300/70">
        {label}
      </p>
      <p className="text-2xl font-semibold text-black dark:text-rose-100">{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-400 dark:text-rose-300/40">{sub}</p>}
    </div>
  );
}

/* ── Set / Edit modal ──────────────────────────────────────────────────── */
function BudgetModal({ initial, onSave, onClose }) {
  const [monthly, setMonthly] = useState(initial?.currentBudget ?? "");
  const [daily, setDaily] = useState(initial?.currentDailyLimit ?? "");
  const [startDate, setStartDate] = useState(initial?.nextPeriodFirstDay ?? todayString());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    const m = parseFloat(monthly);
    const d = parseFloat(daily);
    if (isNaN(m) || m < 0) { setError("Monthly budget must be a non-negative number."); return; }
    if (isNaN(d) || d < 0) { setError("Daily limit must be a non-negative number."); return; }
    if (d > m) { setError("Daily limit cannot exceed monthly budget."); return; }
    if (startDate < todayString()) { setError("Period start date cannot be in the past."); return; }

    setSaving(true);
    setError("");
    try {
      await onSave({ newMonthlyBudget: m, newDailyLimit: d, newPeriodFirstDay: startDate });
    } catch (e) {
      setError(e.response?.data?.message ?? e.message ?? "Couldn't save budget.");
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm text-black " +
    "placeholder:text-zinc-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 " +
    "dark:border-zinc-700 dark:bg-zinc-900 dark:text-rose-100 dark:placeholder:text-rose-300/40 " +
    "dark:focus:ring-rose-900/40 transition-all";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`${styles.popIn} w-full max-w-sm rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950`}>
        <div className="mb-5 flex items-center justify-between">
          <p className="font-medium text-black dark:text-rose-100">
            {initial?.currentBudget != null ? "Edit budget" : "Set budget"}
          </p>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-rose-300/70">
              Monthly budget ($)
            </label>
            <input type="number" min="0" step="0.01" className={inputClass}
              placeholder="e.g. 500.00" value={monthly}
              onChange={(e) => setMonthly(e.target.value)} autoFocus={false} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-rose-300/70">
              Daily limit ($)
            </label>
            <input type="number" min="0" step="0.01" className={inputClass}
              placeholder="e.g. 50.00" value={daily}
              onChange={(e) => setDaily(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-rose-300/70">
              Period start date
            </label>
            <input type="date" className={inputClass} min={todayString()}
              value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
        </div>

        {error && (
          <p className={`${styles.popIn} mt-3 text-center text-sm text-rose-600 dark:text-rose-400`}>{error}</p>
        )}

        <button
          onClick={handleSave} disabled={saving}
          className="mt-5 h-11 w-full rounded-full bg-rose-500 text-sm font-medium text-white transition-all hover:bg-rose-600 active:scale-95 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save budget"}
        </button>
      </div>
    </div>
  );
}

/* ── Delete confirmation ───────────────────────────────────────────────── */
function DeleteConfirm({ onConfirm, onCancel, deleting }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className={`${styles.popIn} w-full max-w-xs rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950`}>
        <p className="text-center font-medium text-black dark:text-rose-100">Remove budget?</p>
        <p className="mt-2 text-center text-sm text-zinc-500 dark:text-rose-300/70">
          This will delete your budget settings. Your transaction history won't be affected.
        </p>
        <div className="mt-5 flex gap-3">
          <button onClick={onCancel} disabled={deleting}
            className="flex-1 h-10 rounded-full border border-zinc-200 text-sm text-zinc-600 transition-all hover:bg-zinc-100 dark:border-zinc-700 dark:text-rose-200 dark:hover:bg-zinc-900">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={deleting}
            className="flex-1 h-10 rounded-full bg-rose-500 text-sm font-medium text-white transition-all hover:bg-rose-600 active:scale-95 disabled:opacity-60">
            {deleting ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const [budget, setBudgetState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchBudget()
      .then((res) => { if (!cancelled) setBudgetState(res.data); })
      .catch((e) => { if (!cancelled) setError(e.response?.data?.message ?? "Couldn't load budget."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function handleSave(data) {
    const res = await setBudget(data);
    setBudgetState(res.data);
    setShowModal(false);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await removeBudget();
      setBudgetState({ currentBudget: null, currentDailyLimit: null, nextPeriodFirstDay: null, budgetLeft: null });
      setShowDelete(false);
    } catch (e) {
      setError(e.response?.data?.message ?? "Couldn't remove budget.");
    } finally {
      setDeleting(false);
    }
  }

  const hasBudget = budget?.currentBudget != null;

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 space-y-4">
        <div className="animate-pulse h-10 w-48 rounded-2xl bg-zinc-200/70 dark:bg-zinc-900" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1,2,3].map((i) => <div key={i} className="animate-pulse h-32 rounded-3xl bg-zinc-200/70 dark:bg-zinc-900" />)}
        </div>
      </main>
    );
  }

  return (
    <main className={`mx-auto w-full max-w-5xl flex-1 px-4 py-10 ${styles.fadeInUp}`}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-rose-100">Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="h-9 rounded-full bg-rose-500 px-4 text-sm font-medium text-white transition-all hover:bg-rose-600 active:scale-95"
          >
            {hasBudget ? "Edit budget" : "Set budget"}
          </button>
          {hasBudget && (
            <button
              onClick={() => setShowDelete(true)}
              className="h-9 rounded-full border border-zinc-200 px-4 text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-100 active:scale-95 dark:border-zinc-700 dark:text-rose-200 dark:hover:bg-zinc-900"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="mb-4 text-sm text-rose-600 dark:text-rose-400">{error}</p>
      )}

      {/* Budget cards */}
      {hasBudget ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Monthly budget"
            value={formatCurrency(budget.currentBudget)}
            sub={budget.budgetLeft != null ? `${formatCurrency(budget.budgetLeft)} remaining` : null}
          />
          <StatCard
            label="Daily limit"
            value={formatCurrency(budget.currentDailyLimit)}
          />
          <StatCard
            label="Next period"
            value={formatDate(budget.nextPeriodFirstDay)}
          />
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-zinc-300 bg-white/60 p-10 text-center dark:border-zinc-700 dark:bg-zinc-950/40">
          <p className="text-sm font-medium text-black dark:text-rose-100">No budget set</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-rose-300/70">
            Set a monthly budget and daily limit to start tracking your spending.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 h-10 rounded-full bg-rose-500 px-5 text-sm font-medium text-white transition-all hover:bg-rose-600 active:scale-95"
          >
            Set budget
          </button>
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <BudgetModal initial={budget} onSave={handleSave} onClose={() => setShowModal(false)} />
      )}
      {showDelete && (
        <DeleteConfirm onConfirm={handleDelete} onCancel={() => setShowDelete(false)} deleting={deleting} />
      )}
    </main>
  );
}