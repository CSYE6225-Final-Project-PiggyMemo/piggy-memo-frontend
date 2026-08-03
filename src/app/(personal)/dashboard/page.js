"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getOverview } from "@/api/dashboard";

const numberFormatter = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 2,
});

function formatAmount(value) {
  return numberFormatter.format(Number(value) || 0);
}

function formatDate(value) {
  const match = String(value).match(/^\d{4}-(\d{2})-(\d{2})/);

  if (!match) return value;

  return `${Number(match[1])}月${Number(match[2])}日`;
}

function SpendingTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-zinc-500 dark:text-rose-300/60">{label}</p>
      <p className="mt-1 font-medium text-zinc-950 dark:text-rose-100">
        Spending: {formatAmount(payload[0].value)}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const response = await getOverview();
        if (!cancelled) setDashboard(response.data);
      } catch (requestError) {
        if (!cancelled && requestError.response?.status !== 401) {
          setError(
            requestError.response?.data?.message ??
              requestError.message ??
              "Couldn't load the dashboard.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  const budget = dashboard?.budgetExecution;
  const monthlyBudget = Math.max(Number(budget?.monthlyBudget) || 0, 0);
  const budgetLeft = Number(budget?.budgetLeft) || 0;
  const amountSpent = Math.max(monthlyBudget - budgetLeft, 0);
  const budgetProgress = monthlyBudget
    ? Math.min((amountSpent / monthlyBudget) * 100, 100)
    : 0;

  const chartData = useMemo(
    () =>
      (dashboard?.monthlySpending ?? []).map(({ date, amount }) => ({
        date: formatDate(date),
        Spending: Number(amount) || 0,
      })),
    [dashboard?.monthlySpending],
  );

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-rose-100">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-rose-300/70">
          Track your budget and daily spending for this month.
        </p>
      </div>

      {loading ? (
        <div className="grid animate-pulse gap-4">
          <div className="h-52 rounded-3xl bg-zinc-200/70 dark:bg-zinc-900" />
          <div className="h-80 rounded-3xl bg-zinc-200/70 dark:bg-zinc-900" />
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 h-10 rounded-full bg-rose-500 px-5 text-sm font-medium text-white transition hover:bg-rose-600 active:scale-95"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-sm font-medium text-zinc-500 dark:text-rose-300/70">
              Budget execution
            </p>
            <div className="mt-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-rose-100">
                  {budgetProgress.toFixed(0)}%
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-rose-300/60">
                  used this month
                </p>
              </div>
              <p className="text-right text-sm text-zinc-600 dark:text-rose-200">
                {formatAmount(amountSpent)} / {formatAmount(monthlyBudget)}
              </p>
            </div>
            <div
              className="mt-5 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(budgetProgress)}
              aria-label={`${budgetProgress.toFixed(0)}% of the monthly budget used`}
            >
              <div
                className="h-full rounded-full bg-rose-500 transition-[width] duration-500"
                style={{ width: `${budgetProgress}%` }}
              />
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-zinc-500 dark:text-rose-300/60">Remaining</span>
              <span
                className={
                  budgetLeft < 0
                    ? "font-medium text-rose-600 dark:text-rose-400"
                    : "font-medium text-zinc-700 dark:text-rose-200"
                }
              >
                {formatAmount(budgetLeft)}
              </span>
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-medium text-zinc-950 dark:text-rose-100">
                  Monthly spending
                </h2>
                <p className="mt-1 text-xs text-zinc-500 dark:text-rose-300/60">
                  Daily spending during the current month
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500 dark:text-rose-300/60">Total</p>
                <p className="text-lg font-semibold text-zinc-950 dark:text-rose-100">
                  {formatAmount(
                    chartData.reduce((total, item) => total + item.Spending, 0),
                  )}
                </p>
              </div>
            </div>

            {chartData.length ? (
              <div className="mt-6 h-64 w-full text-zinc-500 dark:text-rose-300/60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
                    accessibilityLayer
                  >
                    <CartesianGrid
                      stroke="currentColor"
                      strokeDasharray="3 3"
                      vertical={false}
                      opacity={0.18}
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "currentColor", fontSize: 12 }}
                      tickMargin={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "currentColor", fontSize: 12 }}
                      tickFormatter={formatAmount}
                      width={54}
                    />
                    <Tooltip
                      content={<SpendingTooltip />}
                      cursor={{ fill: "currentColor", opacity: 0.06 }}
                    />
                    <Bar
                      dataKey="Spending"
                      fill="#f43f5e"
                      radius={[5, 5, 0, 0]}
                      animationDuration={500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="mt-6 flex h-64 items-center justify-center rounded-2xl bg-zinc-50 text-sm text-zinc-400 dark:bg-zinc-900/60 dark:text-rose-300/40">
                No spending data this month.
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
