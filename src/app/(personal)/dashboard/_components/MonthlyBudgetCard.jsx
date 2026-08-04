"use client";

import { Pencil, WalletCards } from "lucide-react";

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function formatAmount(value) {
  return numberFormatter.format(Number(value) || 0);
}

export default function MonthlyBudgetCard({
  budgetProgress,
  amountSpent,
  monthlyBudget,
  budgetLeft,
  budgetLoadError,
  onManage,
}) {
  return (
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <WalletCards className="size-4 text-rose-500" aria-hidden="true" />
            <p className="text-sm font-medium text-zinc-500 dark:text-rose-300/70">
              Monthly budget
            </p>
          </div>
          <button
              type="button"
              onClick={onManage}
              className="flex h-8 items-center gap-1.5 rounded-full border border-zinc-200 px-3 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 active:scale-95 dark:border-zinc-700 dark:text-rose-200 dark:hover:bg-zinc-900"
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            Manage budget
          </button>
        </div>
        {budgetLoadError && (
            <p
                role="alert"
                className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-950/30 dark:text-rose-400"
            >
              {budgetLoadError}
            </p>
        )}
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
  );
}
