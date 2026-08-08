import request from "@/lib/request";

const BASE_URL = "/api/transactions";

export type TransactionCategory =
  | "HOUSING"
  | "TRANSPORTATION"
  | "FOOD"
  | "DEBTPAYMENTS"
  | "UTILITIES"
  | "CLOTHING"
  | "MEDICAL"
  | "OTHER";

export interface NewTransactionRequest {
  transactionAmount: number;
  category: TransactionCategory;
  notes?: string;
}

export interface TransactionRecord {
  amount: number;
  budgetLeftNow: number | null;
  category: string; // display name e.g. "Food", "Debt payments"
  notes: string;
  time: string;    // ISO-8601 with offset e.g. "2026-07-30T12:00:00-04:00"
  userId: number | null; // who logged it; null for family rows whose logger's account was deleted
}

export interface PagedTransactionResponse {
  records: TransactionRecord[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
}

/** POST /api/transactions/new */
export function newTransaction(data: NewTransactionRequest) {
  return request.post<TransactionRecord>(`${BASE_URL}/new`, data);
}

/**
 * GET /api/transactions/get
 * Note: backend param names are `size` and `pageNumber` (not `length`/`page`)
 */
export function getTransactions(size: number, pageNumber: number) {
  return request.get<PagedTransactionResponse>(`${BASE_URL}/get`, {
    params: { size, pageNumber },
  });
}