"use client";

import { Trash2, X } from "lucide-react";
import { Modal } from "@/components/Modal";

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function formatAmount(value) {
  return numberFormatter.format(Number(value) || 0);
}

export default function ManageBudgetModal({
  budgetDetails,
  budgetLoadError,
  draft,
  setDraft,
  error,
  saving,
  deleting,
  onClose,
  onSubmit,
  onDelete,
}) {
  return (
      <Modal onClose={onClose} labelledBy="budget-dialog-title">
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
                onClick={onClose}
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

          <form onSubmit={onSubmit} className="mt-5">
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
                    value={draft.monthlyBudget}
                    onChange={(event) =>
                        setDraft((current) => ({
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
                    value={draft.dailyLimit}
                    onChange={(event) =>
                        setDraft((current) => ({
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
                  value={draft.periodFirstDay}
                  onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        periodFirstDay: event.target.value,
                      }))
                  }
                  className="mt-2 h-11 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-950 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-rose-100 dark:focus:ring-rose-900/40"
              />
            </div>

            {error && (
                <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">
                  {error}
                </p>
            )}

            <div className="mt-5 flex items-center gap-3">
              {budgetDetails && (
                  <button
                      type="button"
                      onClick={onDelete}
                      disabled={saving || deleting}
                      className="flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    {deleting ? "Removing..." : "Remove"}
                  </button>
              )}
              <button
                  type="submit"
                  disabled={saving || deleting}
                  className="ml-auto h-10 rounded-full bg-rose-500 px-5 text-sm font-medium text-white transition hover:bg-rose-600 active:scale-95 disabled:opacity-50"
              >
                {saving ? "Saving..." : budgetDetails ? "Update budget" : "Set budget"}
              </button>
            </div>
          </form>
      </Modal>
  );
}
