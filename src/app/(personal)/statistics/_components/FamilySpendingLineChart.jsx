"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const LINE_COLORS = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#4a3aa7", "#e34948", "#6b7280"];

function formatCurrency(n) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Pivots the backend's flat {date, userId, amount} rows into recharts' wide
// row format, one column per member keyed by userId. Spending-only (amount > 0),
// matching the personal spending chart's convention on this same page.
function pivotToWideFormat(memberSpending) {
  const byDate = new Map();
  for (const point of memberSpending) {
    if (!(point.amount > 0)) continue;
    if (!byDate.has(point.date)) byDate.set(point.date, { date: point.date });
    const row = byDate.get(point.date);
    const key = String(point.userId);
    row[key] = (row[key] ?? 0) + point.amount;
  }
  return Array.from(byDate.values()).sort((a, b) => (a.date < b.date ? -1 : 1));
}

function FamilyLineTooltip({ active, payload, label, memberNames }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-md dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-xs text-zinc-500 dark:text-rose-300/70">{formatDate(label)}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-sm font-semibold" style={{ color: entry.color }}>
          {memberNames[entry.dataKey] ?? entry.dataKey}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

export default function FamilySpendingLineChart({ memberSpending, members }) {
  // Stable order (never re-colored by sort/filter) so a member's line color never shifts.
  const sortedMembers = [...members].sort((a, b) => a.userId - b.userId);
  const data = pivotToWideFormat(memberSpending ?? []);
  const memberNames = Object.fromEntries(sortedMembers.map((m) => [String(m.userId), m.nickname]));

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:col-span-2">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-rose-300/70">
        Family spending
      </p>
      <p className="mb-4 text-2xl font-semibold text-black dark:text-rose-100">By member</p>
      {data.length === 0 ? (
        <div className="flex h-48 items-center justify-center">
          <p className="text-sm text-zinc-400 dark:text-rose-300/40">No spending logged yet</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip content={<FamilyLineTooltip memberNames={memberNames} />} />
            <Legend
              iconType="line"
              formatter={(value) => (
                <span style={{ fontSize: 12, color: "#6b7280" }}>{memberNames[value] ?? value}</span>
              )}
            />
            {sortedMembers.map((member, index) => (
              <Line
                key={member.userId}
                type="monotone"
                dataKey={String(member.userId)}
                name={String(member.userId)}
                stroke={LINE_COLORS[index % LINE_COLORS.length]}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
