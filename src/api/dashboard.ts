import request from "@/lib/request";

const BASE_URL = "/api/dashboard";

export interface BudgetExecution {
  monthlyBudget: number;
  budgetLeft: number;
}

export interface DailySpending {
  date: string;
  amount: number;
}

/** Per-family-member daily spending; only non-empty when the caller is in a family. */
export interface FamilyMemberDailySpending {
  date: string;
  userId: number;
  amount: number;
}

export interface OverviewDashboardResponse {
  budgetExecution: BudgetExecution;
  monthlySpending: DailySpending[];
  memberSpending: FamilyMemberDailySpending[];
}

export function getOverview() {
  return request.get<OverviewDashboardResponse>(
    `${BASE_URL}/overview`
  );
}
