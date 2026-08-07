"use client";
import { useEffect, useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { getOverview } from "@/api/dashboard";
import { getTransactions } from "@/api/transaction";
import { LoadErrorCard } from "@/components/LoadErrorCard";
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

const TIME_RANGES = [
  { label: "This month", value: "this" },
  { label: "Last month", value: "last" },
  { label: "All time",   value: "all"  },
];

function formatCurrency(n) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 2,
  }).format(n);
}

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function inRange(timeStr, range) {
  const d = new Date(timeStr);
  const now = new Date();
  if (range === "this") {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }
  if (range === "last") {
    const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.getFullYear() === last.getFullYear() && d.getMonth() === last.getMonth();
  }
  return true;
}

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-md dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-xs text-zinc-500 dark:text-rose-300/70">{label}</p>
      {payload[0]?.value > 0 && <p className="text-sm font-semibold text-rose-500">{formatCurrency(payload[0].value)} spent</p>}
      {payload[1]?.value > 0 && <p className="text-sm font-semibold text-emerald-500">{formatCurrency(payload[1].value)} saved</p>}
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

function SummaryCard({ label, value, color }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-rose-300/70">{label}</p>
      <p className={"mt-1 text-lg font-semibold " + color}>{value}</p>
    </div>
  );
}

export default function StatisticsPage() {
  const [overview, setOverview]         = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [range, setRange]               = useState("this");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [overviewRes, txRes] = await Promise.all([
          getOverview(),
          getTransactions(500, 0),
        ]);
        if (cancelled) return;
        setOverview(overviewRes.data);
        setTransactions(txRes.data.records);
      } catch {
        if (!cancelled) setError("Couldn't load statistics.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(
    () => transactions.filter((tx) => inRange(tx.time, range)),
    [transactions, range]
  );

  const totalSpent = useMemo(() => filtered.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0), [filtered]);
  const totalSaved = useMemo(() => filtered.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0), [filtered]);
  const net = totalSpent - totalSaved;

  const categoryData = useMemo(() => {
    const totals = {};
    for (const tx of filtered) {
      if (tx.amount > 0) totals[tx.category] = (totals[tx.category] ?? 0) + tx.amount;
    }
    const total = Object.values(totals).reduce((s, v) => s + v, 0);
    return Object.entries(totals)
      .map(([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(2)),
        pct: total > 0 ? (value / total * 100).toFixed(1) : "0",
      }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  const barData = useMemo(() => {
    const byDate = {};
    for (const tx of filtered) {
      const day = tx.time.slice(0, 10);
      if (!byDate[day]) byDate[day] = { spent: 0, saved: 0 };
      if (tx.amount > 0) byDate[day].spent += tx.amount;
      else byDate[day].saved += Math.abs(tx.amount);
    }
    if (range === "this" && Object.keys(byDate).length === 0 && overview?.monthlySpending?.length) {
      return overview.monthlySpending.map(d => ({ date: formatDate(d.date), spent: d.amount, saved: 0 }));
    }
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, v]) => ({
        date: formatDate(day),
        spent: parseFloat(v.spent.toFixed(2)),
        saved: parseFloat(v.saved.toFixed(2)),
      }));
  }, [filtered, overview, range]);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 space-y-4">
        <div className="animate-pulse h-10 w-48 rounded-2xl bg-zinc-200/70 dark:bg-zinc-900" />
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3].map(i => <div key={i} className="animate-pulse h-20 rounded-2xl bg-zinc-200/70 dark:bg-zinc-900" />)}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="animate-pulse h-80 rounded-3xl bg-zinc-200/70 dark:bg-zinc-900" />
          <div className="animate-pulse h-80 rounded-3xl bg-zinc-200/70 dark:bg-zinc-900" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <LoadErrorCard message={error} />
      </main>
    );
  }

  return (
    <main className={"mx-auto w-full max-w-5xl flex-1 px-4 py-10 " + styles.fadeInUp}>
      {/* Header + time range */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-rose-100">Statistics</h1>
        <div className="flex gap-1 rounded-full bg-zinc-100 p-1 dark:bg-zinc-900">
          {TIME_RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150 " +
                (range === r.value
                  ? "bg-white shadow-sm text-black dark:bg-zinc-800 dark:text-rose-100"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-rose-300/60 dark:hover:text-rose-200")
              }
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <SummaryCard label="Total spent" value={formatCurrency(totalSpent)} color="text-rose-500" />
        <SummaryCard label="Total saved" value={formatCurrency(totalSaved)} color="text-emerald-500" />
        <SummaryCard label="Net"         value={formatCurrency(net)}        color={net <= 0 ? "text-emerald-500" : "text-rose-500"} />
      </div>

      {/* Charts — equal height with flex */}
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
        {/* Daily breakdown bar chart */}
        <div className="flex flex-col rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-rose-300/70">Daily breakdown</p>
          <p className="mb-4 text-xl font-semibold text-black dark:text-rose-100">{formatCurrency(totalSpent)} spent</p>
          {barData.length === 0 ? (
            <div className="flex flex-1 min-h-[200px] items-center justify-center">
              <p className="text-sm text-zinc-400 dark:text-rose-300/40">No data for this period</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="spent" fill="#f43f5e" radius={[3, 3, 0, 0]} maxBarSize={40} />
                <Bar dataKey="saved" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div className="flex flex-col rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-rose-300/70">By category</p>
          <p className="mb-4 text-xl font-semibold text-black dark:text-rose-100">
            {formatCurrency(totalSpent)} · {categoryData.length} {categoryData.length === 1 ? "category" : "categories"}
          </p>
          {categoryData.length === 0 ? (
            <div className="flex flex-1 min-h-[200px] items-center justify-center">
              <p className="text-sm text-zinc-400 dark:text-rose-300/40">No spending for this period</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? "#6b7280"} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => (
                    <span style={{ fontSize: 12 }} className="text-zinc-600 dark:text-rose-200">{v}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Category breakdown list */}
      {categoryData.length > 0 && (
        <div className="mt-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-rose-300/70">Category breakdown</p>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat.name] ?? "#6b7280" }} />
                <span className="flex-1 text-sm text-black dark:text-rose-100">{cat.name}</span>
                <span className="text-xs text-zinc-400 dark:text-rose-300/50 w-10 text-right">{cat.pct}%</span>
                <div className="w-24 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: cat.pct + "%", backgroundColor: CATEGORY_COLORS[cat.name] ?? "#6b7280" }} />
                </div>
                <span className="text-sm font-medium text-black dark:text-rose-100 w-24 text-right">{formatCurrency(cat.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}