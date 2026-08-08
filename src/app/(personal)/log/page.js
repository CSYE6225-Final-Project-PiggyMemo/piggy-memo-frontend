"use client";
import { useState, useRef, useEffect } from "react";
import { newTransaction } from "@/api/transaction";
import styles from "@/components/animations.module.css";

const CATEGORIES = [
  { value: "FOOD",           label: "Food" },
  { value: "HOUSING",        label: "Housing" },
  { value: "TRANSPORTATION", label: "Transportation" },
  { value: "UTILITIES",      label: "Utilities" },
  { value: "CLOTHING",       label: "Clothing" },
  { value: "MEDICAL",        label: "Medical" },
  { value: "DEBTPAYMENTS",   label: "Debt payments" },
  { value: "OTHER",          label: "Other" },
];

const inputClass =
  "w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-black " +
  "placeholder:text-zinc-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 " +
  "dark:border-zinc-700 dark:bg-zinc-900 dark:text-rose-100 dark:placeholder:text-rose-300/40 " +
  "dark:focus:ring-rose-900/40 transition-all";

function ResultCard({ result, onReset }) {
  const isSpending = result.amount > 0;
  const cardRef = useRef(null);

  useEffect(() => {
    // Move focus to the card container so no button gets auto-focused
    cardRef.current?.focus();
  }, []);

  return (
    <div
      ref={cardRef}
      tabIndex="-1"
      className={`${styles.popIn} rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm outline-none dark:border-zinc-800 dark:bg-zinc-950`}
    >
      <div className={`mx-auto mb-4 flex h-14 w-14 select-none items-center justify-center rounded-full text-2xl pointer-events-none ${isSpending ? "bg-rose-100 dark:bg-rose-500/10" : "bg-emerald-100 dark:bg-emerald-500/10"}`}>
        {isSpending ? "💸" : "💰"}
      </div>
      <p className="select-none text-lg font-semibold text-black dark:text-rose-100">
        {isSpending ? "Spending logged" : "Saving logged"}
      </p>
      <p className="select-none mt-1 text-2xl font-bold text-black dark:text-rose-100">
        {isSpending ? "-" : "+"}${Math.abs(result.amount).toFixed(2)}
      </p>
      {isSpending && (
        <p className="select-none mt-1 text-sm text-zinc-500 dark:text-rose-300/70">{result.category}</p>
      )}
      {result.budgetLeftNow != null && (
        <p className="select-none mt-3 text-sm text-zinc-500 dark:text-rose-300/70">
          Budget remaining: <span classNamecurrent="font-medium text-black dark:text-rose-100">${result.budgetLeftNow.toFixed(2)}</span>
        </p>
      )}
      {result.notes && (
        <p className="select-none mt-1 text-sm text-zinc-400 dark:text-rose-300/40 italic">&quot;{result.notes}&quot;</p>
      )}
      <button
        onClick={onReset}
        className="mt-6 h-10 rounded-full bg-rose-500 px-6 text-sm font-medium text-white transition-all hover:bg-rose-600 active:scale-95 focus:outline-none cursor-pointer select-none"
      >
        Log another
      </button>
    </div>
  );
}

export default function LogPage() {
  const [type, setType] = useState("spending");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("FOOD");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function handleSubmit() {
    const val = parseFloat(amount);
    if (!amount || isNaN(val) || val <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await newTransaction({
        transactionAmount: type === "spending" ? val : -val,
        category: type === "spending" ? category : "OTHER",
        notes: notes.trim() || undefined,
      });
      setResult(res.data);
      // Remove focus from any element so no cursor appears on the result card
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    } catch (e) {
      setError(e.response?.data?.message ?? e.message ?? "Couldn't log transaction.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setResult(null);
    setAmount("");
    setNotes("");
    setCategory("FOOD");
    setError("");
  }

  return (
    <main className={`mx-auto w-full max-w-lg flex-1 px-4 py-10 ${styles.fadeInUp}`}>
      <h1 className="mb-6 select-none text-2xl font-semibold tracking-tight text-black dark:text-rose-100">
        Log spending / saving
      </h1>

      {result ? (
        <ResultCard result={result} onReset={handleReset} />
      ) : (
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-6 flex gap-1 rounded-full bg-zinc-100 p-1 dark:bg-zinc-900">
            <button
              onClick={() => setType("spending")}
              className={`flex-1 py-1.5 text-sm rounded-full transition-all duration-150 ${type === "spending" ? "bg-white dark:bg-zinc-800 shadow-sm text-black dark:text-rose-100 font-medium" : "text-zinc-500 dark:text-rose-300/60"}`}
            >
              💸 Spending
            </button>
            <button
              onClick={() => setType("saving")}
              className={`flex-1 py-1.5 text-sm rounded-full transition-all duration-150 ${type === "saving" ? "bg-white dark:bg-zinc-800 shadow-sm text-black dark:text-rose-100 font-medium" : "text-zinc-500 dark:text-rose-300/60"}`}
            >
              💰 Saving
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-rose-300/70">
                Amount ($)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-400 dark:text-rose-300/40">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={`${inputClass} pl-7`}
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  autoFocus={false}
                />
              </div>
            </div>

            {type === "spending" && (
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-rose-300/70">
                Category
              </label>
              <select
                className={inputClass}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-rose-300/70">
                Notes <span className="normal-case text-zinc-400 dark:text-rose-300/40">(optional)</span>
              </label>
              <textarea
                className={`${inputClass} resize-none`}
                placeholder="e.g. lunch with friends"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={200}
              />
              <p className="mt-1 text-right text-xs text-zinc-400 dark:text-rose-300/40">
                {notes.length}/200
              </p>
            </div>
          </div>

          {error && (
            <p className={`${styles.popIn} mt-3 text-center text-sm text-rose-600 dark:text-rose-400`}>
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-5 h-11 w-full rounded-full bg-rose-500 text-sm font-medium text-white transition-all hover:bg-rose-600 active:scale-95 disabled:opacity-60"
          >
            {submitting ? "Logging..." : `Log ${type}`}
          </button>
        </div>
      )}
    </main>
  );
}