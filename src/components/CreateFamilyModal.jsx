"use client";

import { useState } from "react";
import { Check, Copy, X } from "lucide-react";
import { Modal } from "@/components/Modal";
import { createFamily } from "@/api/family";

export default function CreateFamilyModal({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);

  async function handleCreate() {
    setCreating(true);
    setError("");
    try {
      const res = await createFamily(name.trim() ? { name: name.trim() } : undefined);
      setCreated(res.data);
    } catch (e) {
      setError(e.response?.data?.message ?? e.message ?? "Couldn't create a family.");
    } finally {
      setCreating(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(created.familyCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
      <Modal onClose={onClose} labelledBy="create-family-title" maxWidth="max-w-sm">
        <div className="flex items-start justify-between gap-4">
          <h2 id="create-family-title" className="font-semibold text-zinc-950 dark:text-rose-100">
            {created ? "Family created" : "Create a family"}
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

        {created ? (
            <div className="mt-5">
              <p className="text-xs text-zinc-500 dark:text-rose-300/60">
                Share this code so others can request to join your family.
              </p>
              <p className="mt-3 text-sm font-medium text-zinc-950 dark:text-rose-100">{created.familyName}</p>
              <div className="mt-2 flex items-center justify-between gap-3 rounded-2xl bg-zinc-50 px-4 py-3 dark:bg-zinc-900/70">
                <span className="font-mono text-lg font-semibold tracking-wider text-zinc-950 dark:text-rose-100">
                  {created.familyCode}
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
              <button
                  type="button"
                  onClick={() => onCreated?.(created)}
                  className="mt-5 flex h-11 w-full items-center justify-center rounded-full bg-rose-500 text-sm font-medium text-white transition-all hover:bg-rose-600 active:scale-95"
              >
                Done
              </button>
            </div>
        ) : (
            <div className="mt-5">
              <p className="text-sm text-zinc-500 dark:text-rose-300/70">
                We&apos;ll generate a random, shareable code for your new family. Give this code to
                others so they can request to join.
              </p>
              <label
                  htmlFor="family-name"
                  className="mt-4 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-rose-300/70"
              >
                Family name (optional)
              </label>
              <input
                  id="family-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Happy Family"
                  maxLength={100}
                  className="mt-2 h-11 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-rose-100 dark:focus:ring-rose-900/40"
              />
              {error && (
                  <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</p>
              )}
              <button
                  type="button"
                  onClick={handleCreate}
                  disabled={creating}
                  className="mt-5 flex h-11 w-full items-center justify-center rounded-full bg-rose-500 text-sm font-medium text-white transition-all hover:bg-rose-600 active:scale-95 disabled:opacity-60"
              >
                {creating ? "Creating..." : "Create family"}
              </button>
            </div>
        )}
      </Modal>
  );
}
