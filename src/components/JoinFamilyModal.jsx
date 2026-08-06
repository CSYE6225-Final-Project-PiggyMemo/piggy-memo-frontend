"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Modal } from "@/components/Modal";
import { joinFamily } from "@/api/family";

const inputClass =
  "mt-2 h-11 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-center font-mono text-sm uppercase tracking-widest text-zinc-950 outline-none transition " +
  "placeholder:font-sans placeholder:text-sm placeholder:normal-case placeholder:tracking-normal placeholder:text-zinc-400 " +
  "focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 " +
  "dark:border-zinc-700 dark:bg-zinc-900 dark:text-rose-100 dark:placeholder:text-rose-300/40 dark:focus:ring-rose-900/40";

export default function JoinFamilyModal({ onClose, onRequested }) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [requested, setRequested] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!code.trim()) {
      setError("Enter a family code.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await joinFamily({ familyCode: code.trim() });
      setRequested(true);
    } catch (e) {
      setError(e.response?.data?.message ?? e.message ?? "Couldn't send a join request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
      <Modal onClose={onClose} labelledBy="join-family-title" maxWidth="max-w-sm">
        <div className="flex items-start justify-between gap-4">
          <h2 id="join-family-title" className="font-semibold text-zinc-950 dark:text-rose-100">
            {requested ? "Request sent" : "Join a family"}
          </h2>
          <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-rose-100"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        {requested ? (
            <div className="mt-5">
              <p className="text-sm text-zinc-500 dark:text-rose-300/70">
                The family owner needs to approve your request before you&apos;ll see family data.
              </p>
              <button
                  type="button"
                  onClick={() => onRequested?.()}
                  className="mt-5 flex h-11 w-full items-center justify-center rounded-full bg-rose-500 text-sm font-medium text-white transition-all hover:bg-rose-600 active:scale-95"
              >
                Done
              </button>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="mt-5">
              <label
                  htmlFor="family-code"
                  className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-rose-300/70"
              >
                Family code
              </label>
              <input
                  id="family-code"
                  type="text"
                  required
                  autoFocus
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="e.g. AB3D9F"
                  maxLength={16}
                  className={inputClass}
              />
              {error && (
                  <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</p>
              )}
              <button
                  type="submit"
                  disabled={submitting}
                  className="mt-5 flex h-11 w-full items-center justify-center rounded-full bg-rose-500 text-sm font-medium text-white transition-all hover:bg-rose-600 active:scale-95 disabled:opacity-60"
              >
                {submitting ? "Sending..." : "Send join request"}
              </button>
            </form>
        )}
      </Modal>
  );
}
