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

export interface OverviewDashboardResponse {
  budgetExecution: BudgetExecution;
  monthlySpending: DailySpending[];
}

export function getOverview() {
  return request.get<OverviewDashboardResponse>(
    `${BASE_URL}/overview`
  );
}
