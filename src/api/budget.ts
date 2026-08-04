import request from "@/lib/request";

const baseURL = "/api/budget";

export interface BudgetResponse {
  currentBudget: number;
  currentDailyLimit: number;
  nextPeriodFirstDay: string;
  budgetLeft: number;
}

export interface SetBudgetRequest {
  newMonthlyBudget: number;
  newDailyLimit: number;
  newPeriodFirstDay: string;
}

export function setBudget(data: SetBudgetRequest) {
  return request.post<BudgetResponse>(`${baseURL}/set`, data);
}

export function fetchBudget() {
  return request.get<BudgetResponse>(`${baseURL}/fetch`);
}

export function deleteBudget() {
  return request.delete<void>(`${baseURL}/remove`);
}