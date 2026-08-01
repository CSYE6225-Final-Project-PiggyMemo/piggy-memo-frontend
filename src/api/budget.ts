import request from "@/lib/request";

const BASE_URL = "/api/budget";

export interface BudgetResponse {
  currentBudget: number | null;
  currentDailyLimit: number | null;
  nextPeriodFirstDay: string | null;  // "YYYY-MM-DD"
  budgetLeft: number | null;
}

/**
 * All fields optional — only sent fields are updated.
 * Constraint: newDailyLimit must not exceed newMonthlyBudget (400 if violated).
 * newPeriodFirstDay must not be earlier than today.
 */
export interface SetBudgetRequest {
  newMonthlyBudget?: number;
  newDailyLimit?: number;
  newPeriodFirstDay?: string;  // "YYYY-MM-DD"
}

/** GET /api/budget/fetch — returns nulls if budget has never been set */
export function fetchBudget() {
  return request.get<BudgetResponse>(`${BASE_URL}/fetch`);
}

/** POST /api/budget/set — create or partially update budget */
export function setBudget(data: SetBudgetRequest) {
  return request.post<BudgetResponse>(`${BASE_URL}/set`, data);
}

/** DELETE /api/budget/remove — returns 204 no body */
export function removeBudget() {
  return request.delete(`${BASE_URL}/remove`);
}