"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { approveJoinRequest, rejectJoinRequest } from "@/api/family";

export default function PendingRequestsCard({ requests, onChanged }) {
  const [processingId, setProcessingId] = useState(null);
  const [rowError, setRowError] = useState({});

  async function handleApprove(requestId) {
    setProcessingId(requestId);
    setRowError((current) => ({ ...current, [requestId]: "" }));
    try {
      await approveJoinRequest(requestId);
      onChanged();
    } catch (e) {
      setRowError((current) => ({
        ...current,
        [requestId]: e.response?.data?.message ?? e.message ?? "Couldn't approve this request.",
      }));
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(requestId) {
    setProcessingId(requestId);
    setRowError((current) => ({ ...current, [requestId]: "" }));
    try {
      await rejectJoinRequest(requestId);
      onChanged();
    } catch (e) {
      setRowError((current) => ({
        ...current,
        [requestId]: e.response?.data?.message ?? e.message ?? "Couldn't reject this request.",
      }));
    } finally {
      setProcessingId(null);
    }
  }

  return (
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-medium text-zinc-950 dark:text-rose-100">Pending requests</h2>
        {requests.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-400 dark:text-rose-300/40">No pending requests</p>
        ) : (
            <div className="mt-4 flex flex-col gap-2">
              {requests.map((req) => (
                  <div key={req.requestId} className="rounded-2xl px-2 py-2">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-500 text-sm font-semibold text-white">
                        {req.nickname?.[0]?.toUpperCase() ?? "?"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-950 dark:text-rose-100">
                          {req.nickname}
                        </p>
                      </div>
                      <button
                          type="button"
                          onClick={() => handleApprove(req.requestId)}
                          disabled={processingId === req.requestId}
                          aria-label={`Approve ${req.nickname}`}
                          className="flex h-8 shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-3 text-xs font-medium text-emerald-600 transition hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-500/10 dark:text-emerald-400"
                      >
                        <Check className="size-3.5" aria-hidden="true" />
                        Approve
                      </button>
                      <button
                          type="button"
                          onClick={() => handleReject(req.requestId)}
                          disabled={processingId === req.requestId}
                          aria-label={`Reject ${req.nickname}`}
                          className="flex h-8 shrink-0 items-center gap-1 rounded-full px-3 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                      >
                        <X className="size-3.5" aria-hidden="true" />
                        Reject
                      </button>
                    </div>
                    {rowError[req.requestId] && (
                        <p role="alert" className="mt-1.5 pl-12 text-xs text-rose-600 dark:text-rose-400">
                          {rowError[req.requestId]}
                        </p>
                    )}
                  </div>
              ))}
            </div>
        )}
      </section>
  );
}
