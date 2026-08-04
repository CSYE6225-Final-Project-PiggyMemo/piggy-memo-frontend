"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function formatAmount(value) {
  return numberFormatter.format(Number(value) || 0);
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

export default function SpendingChartCard({ chartData }) {
  const total = chartData.reduce((sum, item) => sum + item.Spending, 0);

  return (
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
              {formatAmount(total)}
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
  );
}
