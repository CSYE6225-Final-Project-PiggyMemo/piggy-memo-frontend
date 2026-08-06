"use client";

import { useEffect, useState } from "react";
import { getMyFamily, leaveFamily, removeMember, transferOwnership } from "@/api/family";
import { LoadErrorCard } from "@/components/LoadErrorCard";
import CreateFamilyModal from "@/components/CreateFamilyModal";
import JoinFamilyModal from "@/components/JoinFamilyModal";
import FamilyHeaderCard from "./_components/FamilyHeaderCard";
import FamilyMembersCard from "./_components/FamilyMembersCard";
import PendingRequestsCard from "./_components/PendingRequestsCard";

export default function FamilyPage() {
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinRequested, setJoinRequested] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await getMyFamily();
        if (!cancelled) setFamily(result);
      } catch (e) {
        if (!cancelled && e.response?.status !== 401) {
          setError(e.response?.data?.message ?? e.message ?? "Couldn't load your family.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function refreshFamily() {
    try {
      const result = await getMyFamily();
      setFamily(result);
    } catch {
      // keep whatever was already shown rather than blanking the page on a transient refresh failure
    }
  }

  async function handleTransfer(newOwnerUserId) {
    setTransferring(true);
    setActionError("");
    try {
      await transferOwnership({ newOwnerUserId });
      await refreshFamily();
    } catch (e) {
      setActionError(e.response?.data?.message ?? e.message ?? "Couldn't transfer ownership.");
    } finally {
      setTransferring(false);
    }
  }

  async function handleLeave() {
    if (!window.confirm("Leave this family?")) return;
    setLeaving(true);
    setActionError("");
    try {
      await leaveFamily();
      setFamily(null);
    } catch (e) {
      setActionError(e.response?.data?.message ?? e.message ?? "Couldn't leave the family.");
    } finally {
      setLeaving(false);
    }
  }

  async function handleRemove(userId) {
    if (!window.confirm("Remove this member from the family?")) return;
    setRemovingId(userId);
    setActionError("");
    try {
      await removeMember(userId);
      await refreshFamily();
    } catch (e) {
      setActionError(e.response?.data?.message ?? e.message ?? "Couldn't remove this member.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-rose-100">Family</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-rose-300/70">
            Manage your family, its members, and join requests.
          </p>
        </div>

        {loading ? (
            <div className="grid animate-pulse gap-4">
              <div className="h-44 rounded-3xl bg-zinc-200/70 dark:bg-zinc-900" />
              <div className="h-44 rounded-3xl bg-zinc-200/70 dark:bg-zinc-900" />
            </div>
        ) : error ? (
            <LoadErrorCard message={error} />
        ) : family ? (
            <div className="grid gap-4">
              <FamilyHeaderCard
                  family={family}
                  onTransfer={handleTransfer}
                  onLeave={handleLeave}
                  transferring={transferring}
                  leaving={leaving}
              />

              {actionError && (
                  <p
                      role="alert"
                      className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-950/30 dark:text-rose-400"
                  >
                    {actionError}
                  </p>
              )}

              {family.role === "OWNER" && (
                  <PendingRequestsCard requests={family.joinRequests} onChanged={refreshFamily} />
              )}

              <FamilyMembersCard family={family} onRemove={handleRemove} removingId={removingId} />
            </div>
        ) : (
            <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm text-zinc-500 dark:text-rose-300/70">
                You&apos;re not part of a family yet.
              </p>
              {joinRequested && (
                  <p className="mt-2 text-xs text-zinc-400 dark:text-rose-300/40">
                    Your join request is pending approval.
                  </p>
              )}
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                    type="button"
                    onClick={() => setCreateModalOpen(true)}
                    className="h-10 rounded-full bg-rose-500 px-5 text-sm font-medium text-white transition hover:bg-rose-600 active:scale-95"
                >
                  Create family
                </button>
                <button
                    type="button"
                    onClick={() => setJoinModalOpen(true)}
                    className="flex h-10 items-center gap-1.5 rounded-full border border-zinc-200 px-5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-rose-200 dark:hover:bg-zinc-900"
                >
                  Join family
                </button>
              </div>
            </div>
        )}

        {createModalOpen && (
            <CreateFamilyModal
                onClose={() => setCreateModalOpen(false)}
                onCreated={() => {
                  setCreateModalOpen(false);
                  refreshFamily();
                }}
            />
        )}

        {joinModalOpen && (
            <JoinFamilyModal
                onClose={() => setJoinModalOpen(false)}
                onRequested={() => {
                  setJoinModalOpen(false);
                  setJoinRequested(true);
                }}
            />
        )}
      </main>
  );
}
