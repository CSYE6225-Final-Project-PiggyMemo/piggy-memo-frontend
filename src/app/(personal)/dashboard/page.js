"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, WalletCards, X } from "lucide-react";
import { getOverview } from "@/api/dashboard";
import { deleteBudget, fetchBudget, setBudget } from "@/api/budget";
import SpendingChartCard from "./_components/SpendingChartCard";

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function formatAmount(value) {
  return numberFormatter.format(Number(value) || 0);
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

function formatDate(value) {
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) return value;

  const [, year, month, day] = match;
  return dateFormatter.format(new Date(Number(year), Number(month) - 1, Number(day)));
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [budgetDetails, setBudgetDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState({
    monthlyBudget: "",
    dailyLimit: "",
    periodFirstDay: "",
  });
  const [budgetSaving, setBudgetSaving] = useState(false);
  const [budgetDeleting, setBudgetDeleting] = useState(false);
  const [budgetError, setBudgetError] = useState("");
  const [budgetLoadError, setBudgetLoadError] = useState("");

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

  useEffect(() => {
    let cancelled = false;

    async function loadBudget() {
      try {
        const response = await fetchBudget();
        if (!cancelled) {
          setBudgetDetails(response.data);
          setBudgetLoadError("");
        }
      } catch (requestError) {
        if (!cancelled && requestError.response?.status !== 401) {
          setBudgetLoadError(
              requestError.response?.data?.message ??
              requestError.message ??
              "Couldn't load your budget settings.",
          );
        }
      }
    }

    loadBudget();
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

  function openBudgetModal() {
    setBudgetDraft({
      monthlyBudget: String(
          budgetDetails?.currentBudget ?? monthlyBudget ?? "",
      ),
      dailyLimit: String(budgetDetails?.currentDailyLimit ?? ""),
      periodFirstDay: budgetDetails?.nextPeriodFirstDay?.slice(0, 10) ?? "",
    });
    setBudgetError("");
    setBudgetModalOpen(true);
  }

  function closeBudgetModal() {
    if (budgetSaving || budgetDeleting) return;
    setBudgetModalOpen(false);
    setBudgetError("");
  }

  async function handleBudgetSubmit(event) {
    event.preventDefault();
    const newMonthlyBudget = Number(budgetDraft.monthlyBudget);
    const newDailyLimit = Number(budgetDraft.dailyLimit);

    if (
        !Number.isFinite(newMonthlyBudget) ||
        !Number.isFinite(newDailyLimit) ||
        newMonthlyBudget < 0 ||
        newDailyLimit < 0
    ) {
      setBudgetError("Budget and daily limit must be 0 or greater.");
      return;
    }

    if (!budgetDraft.periodFirstDay) {
      setBudgetError("Choose the first day of the next budget period.");
      return;
    }

    setBudgetSaving(true);
    setBudgetError("");
    try {
      const response = await setBudget({
        newMonthlyBudget,
        newDailyLimit,
        newPeriodFirstDay: budgetDraft.periodFirstDay,
      });
      setBudgetDetails(response.data);
      setBudgetLoadError("");
      setDashboard((current) => ({
        ...current,
        budgetExecution: {
          monthlyBudget: response.data.currentBudget,
          budgetLeft: response.data.budgetLeft,
        },
      }));
      setBudgetModalOpen(false);
    } catch (requestError) {
      setBudgetError(
          requestError.response?.data?.message ??
          requestError.message ??
          "Couldn't save your budget.",
      );
    } finally {
      setBudgetSaving(false);
    }
  }

  async function handleBudgetDelete() {
    if (!window.confirm("Remove your current monthly budget?")) return;

    setBudgetDeleting(true);
    setBudgetError("");
    try {
      await deleteBudget();
      setBudgetDetails(null);
      setBudgetLoadError("");
      setDashboard((current) => ({
        ...current,
        budgetExecution: { monthlyBudget: 0, budgetLeft: 0 },
      }));
      setBudgetModalOpen(false);
    } catch (requestError) {
      setBudgetError(
          requestError.response?.data?.message ??
          requestError.message ??
          "Couldn't remove your budget.",
      );
    } finally {
      setBudgetDeleting(false);
    }
  }

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
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <WalletCards className="size-4 text-rose-500" aria-hidden="true" />
                    <p className="text-sm font-medium text-zinc-500 dark:text-rose-300/70">
                      Budget execution
                    </p>
                  </div>
                  <button
                      type="button"
                      onClick={openBudgetModal}
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

              <SpendingChartCard chartData={chartData} />
            </div>
        )}

        {budgetModalOpen && (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
                role="presentation"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) closeBudgetModal();
                }}
            >
              <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="budget-dialog-title"
                  className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2
                        id="budget-dialog-title"
                        className="font-semibold text-zinc-950 dark:text-rose-100"
                    >
                      Manage monthly budget
                    </h2>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-rose-300/60">
                      Set a limit to keep this month&apos;s spending on track.
                    </p>
                  </div>
                  <button
                      type="button"
                      onClick={closeBudgetModal}
                      aria-label="Close budget management"
                      className="flex size-8 shrink-0 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-rose-100"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </div>

                {budgetDetails && (
                    <dl className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900/70">
                      <div>
                        <dt className="text-xs text-zinc-500 dark:text-rose-300/60">
                          Daily limit
                        </dt>
                        <dd className="mt-1 text-sm font-semibold text-zinc-950 dark:text-rose-100">
                          {formatAmount(budgetDetails.currentDailyLimit)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-zinc-500 dark:text-rose-300/60">
                          Next period
                        </dt>
                        <dd className="mt-1 text-sm font-semibold text-zinc-950 dark:text-rose-100">
                          {budgetDetails.nextPeriodFirstDay || "—"}
                        </dd>
                      </div>
                    </dl>
                )}

                <form onSubmit={handleBudgetSubmit} className="mt-5">
                  {budgetLoadError && (
                      <p
                          role="alert"
                          className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-950/30 dark:text-rose-400"
                      >
                        {budgetLoadError}
                      </p>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                          htmlFor="monthly-budget"
                          className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-rose-300/70"
                      >
                        Monthly budget
                      </label>
                      <input
                          id="monthly-budget"
                          type="number"
                          min="0"
                          step="1"
                          inputMode="decimal"
                          required
                          autoFocus
                          value={budgetDraft.monthlyBudget}
                          onChange={(event) =>
                              setBudgetDraft((current) => ({
                                ...current,
                                monthlyBudget: event.target.value,
                              }))
                          }
                          placeholder="e.g. 3000"
                          className="mt-2 h-11 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-rose-100 dark:focus:ring-rose-900/40"
                      />
                    </div>

                    <div>
                      <label
                          htmlFor="daily-limit"
                          className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-rose-300/70"
                      >
                        Daily limit
                      </label>
                      <input
                          id="daily-limit"
                          type="number"
                          min="0"
                          step="1"
                          inputMode="decimal"
                          required
                          value={budgetDraft.dailyLimit}
                          onChange={(event) =>
                              setBudgetDraft((current) => ({
                                ...current,
                                dailyLimit: event.target.value,
                              }))
                          }
                          placeholder="e.g. 100"
                          className="mt-2 h-11 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-rose-100 dark:focus:ring-rose-900/40"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label
                        htmlFor="period-first-day"
                        className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-rose-300/70"
                    >
                      Next period first day
                    </label>
                    <input
                        id="period-first-day"
                        type="date"
                        required
                        value={budgetDraft.periodFirstDay}
                        onChange={(event) =>
                            setBudgetDraft((current) => ({
                              ...current,
                              periodFirstDay: event.target.value,
                            }))
                        }
                        className="mt-2 h-11 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-950 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-rose-100 dark:focus:ring-rose-900/40"
                    />
                  </div>

                  {budgetError && (
                      <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">
                        {budgetError}
                      </p>
                  )}

                  <div className="mt-5 flex items-center gap-3">
                    {budgetDetails && (
                        <button
                            type="button"
                            onClick={handleBudgetDelete}
                            disabled={budgetSaving || budgetDeleting}
                            className="flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          {budgetDeleting ? "Removing..." : "Remove"}
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={budgetSaving || budgetDeleting}
                        className="ml-auto h-10 rounded-full bg-rose-500 px-5 text-sm font-medium text-white transition hover:bg-rose-600 active:scale-95 disabled:opacity-50"
                    >
                      {budgetSaving ? "Saving..." : budgetDetails ? "Update budget" : "Set budget"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </main>
  );
}
