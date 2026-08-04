"use client";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { getOverview } from "@/api/dashboard";
import { getTransactions } from "@/api/transaction";
import styles from "@/components/animations.module.css";

const CATEGORY_COLORS = {
  Food:            "#f97316",
  Housing:         "#8b5cf6",
  Transportation:  "#3b82f6",
  Utilities:       "#10b981",
  Clothing:        "#ec4899",
  Medical:         "#ef4444",
  "Debt payments": "#f59e0b",
  Other:           "#6b7280",
};

function formatCurrency(n) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function LineTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-md dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-xs text-zinc-500 dark:text-rose-300/70">{label}</p>
      <p className="text-sm font-semibold text-black dark:text-rose-100">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-md dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-xs text-zinc-500 dark:text-rose-300/70">{payload[0].name}</p>
      <p className="text-sm font-semibold text-black dark:text-rose-100">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export default function StatisticsPage() {
  const [overview, setOverview] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [overviewRes, txRes] = await Promise.all([
          getOverview(),
          getTransactions(200, 0),
        ]);
        if (cancelled) return;
        setOverview(overviewRes.data);

        // Group spending (positive amounts) by display category
        const totals = {};
        for (const tx of txRes.data.records) {
          if (tx.amount > 0) {
            totals[tx.category] = (totals[tx.category] ?? 0) + tx.amount;
          }
        }
        setCategoryData(
          Object.entries(totals)
            .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
            .sort((a, b) => b.value - a.value)
        );
      } catch {
        if (!cancelled) setError("Couldn't load statistics.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const spendingData = (overview?.monthlySpending ?? []).map((d) => ({
    date: formatDate(d.date),
    amount: d.amount,
  }));

  const totalSpent = spendingData.reduce((s, d) => s + d.amount, 0);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 space-y-4">
        <div className="animate-pulse h-10 w-48 rounded-2xl bg-zinc-200/70 dark:bg-zinc-900" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="animate-pulse h-72 rounded-3xl bg-zinc-200/70 dark:bg-zinc-900" />
          <div className="animate-pulse h-72 rounded-3xl bg-zinc-200/70 dark:bg-zinc-900" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 h-10 rounded-full bg-rose-500 px-5 text-sm font-medium text-white transition-all hover:bg-rose-600 active:scale-95">
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={`mx-auto w-full max-w-5xl flex-1 px-4 py-10 ${styles.fadeInUp}`}>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-black dark:text-rose-100">Statistics</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Monthly spending trend */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-rose-300/70">Monthly spending</p>
          <p className="mb-4 text-2xl font-semibold text-black dark:text-rose-100">{formatCurrency(totalSpent)}</p>
          {spendingData.length === 0 ? (
            <div className="flex h-48 items-center justify-center">
              <p className="text-sm text-zinc-400 dark:text-rose-300/40">No spending data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={spendingData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<LineTooltip />} />
                <Bar dataKey="amount" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Spending by category */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-rose-300/70">By category</p>
          <p className="mb-4 text-2xl font-semibold text-black dark:text-rose-100">
            {categoryData.length} {categoryData.length === 1 ? "category" : "categories"}
          </p>
          {categoryData.length === 0 ? (
            <div className="flex h-48 items-center justify-center">
              <p className="text-sm text-zinc-400 dark:text-rose-300/40">No transactions yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? "#6b7280"} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 12, color: "#6b7280" }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </main>
  );
}