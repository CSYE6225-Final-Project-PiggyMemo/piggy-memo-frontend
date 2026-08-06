"use client";

import { useEffect, useMemo, useState } from "react";
import { getOverview } from "@/api/dashboard";
import { deleteBudget, fetchBudget, setBudget } from "@/api/budget";
import { getMyFamily } from "@/api/family";
import { LoadErrorCard } from "@/components/LoadErrorCard";
import ManageBudgetModal from "./_components/ManageBudgetModal";
import MonthlyBudgetCard from "./_components/MonthlyBudgetCard";
import SpendingChartCard from "./_components/SpendingChartCard";

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
  const [family, setFamily] = useState(null);

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

  useEffect(() => {
    let cancelled = false;

    async function loadFamily() {
      try {
        const result = await getMyFamily();
        if (!cancelled) setFamily(result);
      } catch {
        // Real enforcement of who can edit the budget happens server-side in
        // BudgetService; a hiccup fetching the family here should never lock
        // a legitimate owner out of their own budget UI, so default to permissive.
      }
    }

    loadFamily();
    return () => {
      cancelled = true;
    };
  }, []);

  const canManageBudget = !family || family.role === "OWNER";

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
    if (!canManageBudget) return;
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
        newDailyLimit <= 0
    ) {
      setBudgetError("Monthly budget must be 0 or greater, and daily limit must be greater than 0.");
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
            <LoadErrorCard message={error} />
        ) : (
            <div className="grid gap-4">
              <MonthlyBudgetCard
                  budgetProgress={budgetProgress}
                  amountSpent={amountSpent}
                  monthlyBudget={monthlyBudget}
                  budgetLeft={budgetLeft}
                  budgetLoadError={budgetLoadError}
                  onManage={openBudgetModal}
                  canManage={canManageBudget}
              />

              <SpendingChartCard chartData={chartData} />
            </div>
        )}

        {budgetModalOpen && (
            <ManageBudgetModal
                budgetDetails={budgetDetails}
                budgetLoadError={budgetLoadError}
                draft={budgetDraft}
                setDraft={setBudgetDraft}
                error={budgetError}
                saving={budgetSaving}
                deleting={budgetDeleting}
                onClose={closeBudgetModal}
                onSubmit={handleBudgetSubmit}
                onDelete={handleBudgetDelete}
            />
        )}
      </main>
  );
}
