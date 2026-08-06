"use client";

import { useState } from "react";
import { Check, Copy, LogOut, Repeat } from "lucide-react";

export default function FamilyHeaderCard({ family, onTransfer, onLeave, transferring, leaving }) {
  const [copied, setCopied] = useState(false);
  const [transferTarget, setTransferTarget] = useState("");

  const isOwner = family.role === "OWNER";
  const otherMembers = family.members.filter((m) => m.userId !== family.ownerUserId);
  const canLeave = !isOwner || family.members.length === 1;

  function handleCopy() {
    navigator.clipboard.writeText(family.familyCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleTransferSubmit(event) {
    event.preventDefault();
    if (!transferTarget) return;
    onTransfer(Number(transferTarget));
    setTransferTarget("");
  }

  return (
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-zinc-950 dark:text-rose-100">{family.familyName}</p>
            <span
                className={
                  isOwner
                      ? "rounded-full bg-rose-500 px-2 py-0.5 text-xs font-medium text-white"
                      : "rounded-full border border-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:text-rose-200"
                }
            >
              {isOwner ? "Owner" : "Member"}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-rose-300/60">
            {family.members.length} {family.members.length === 1 ? "member" : "members"}
          </p>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3 rounded-2xl bg-zinc-50 px-4 py-3 dark:bg-zinc-900/70">
          <span className="font-mono text-lg font-semibold tracking-wider text-zinc-950 dark:text-rose-100">
            {family.familyCode}
          </span>
          <button
              type="button"
              onClick={handleCopy}
              className="flex h-8 items-center gap-1.5 rounded-full border border-zinc-200 px-3 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-rose-200 dark:hover:bg-zinc-800"
          >
            {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        {isOwner && otherMembers.length > 0 && (
            <form onSubmit={handleTransferSubmit} className="mt-4 flex items-center gap-2">
              <select
                  value={transferTarget}
                  onChange={(event) => setTransferTarget(event.target.value)}
                  disabled={transferring}
                  className="h-9 flex-1 rounded-full border border-zinc-200 bg-white px-3 text-xs text-zinc-600 outline-none focus:border-rose-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-rose-200"
              >
                <option value="">Transfer ownership to...</option>
                {otherMembers.map((m) => (
                    <option key={m.userId} value={m.userId}>{m.nickname}</option>
                ))}
              </select>
              <button
                  type="submit"
                  disabled={!transferTarget || transferring}
                  className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-zinc-200 px-3 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-rose-200 dark:hover:bg-zinc-800"
              >
                <Repeat className="size-3.5" aria-hidden="true" />
                {transferring ? "Transferring..." : "Transfer"}
              </button>
            </form>
        )}

        <div className="mt-4">
          {canLeave ? (
              <button
                  type="button"
                  onClick={onLeave}
                  disabled={leaving}
                  className="flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
              >
                <LogOut className="size-3.5" aria-hidden="true" />
                {leaving ? "Leaving..." : "Leave family"}
              </button>
          ) : (
              <p className="text-xs text-zinc-400 dark:text-rose-300/40">
                Transfer ownership before you can leave this family.
              </p>
          )}
        </div>
      </section>
  );
}
