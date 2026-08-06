"use client";

import { Crown, UserMinus } from "lucide-react";

function MemberAvatar({ url, initial }) {
  return url ? (
      <img
          src={url}
          alt=""
          className="h-9 w-9 rounded-full object-cover ring-2 ring-white dark:ring-zinc-900"
      />
  ) : (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-500 text-sm font-semibold text-white">
        {initial}
      </span>
  );
}

export default function FamilyMembersCard({ family, onRemove, removingId }) {
  const isOwner = family.role === "OWNER";

  return (
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-medium text-zinc-950 dark:text-rose-100">Members</h2>
        <div className="mt-4 flex flex-col gap-1">
          {family.members.map((member) => {
            const initial = member.nickname?.[0]?.toUpperCase() ?? "?";
            const canRemove = isOwner && member.userId !== family.ownerUserId;
            return (
                <div
                    key={member.userId}
                    className="flex items-center gap-3 rounded-2xl px-2 py-2 transition hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
                >
                  <MemberAvatar url={member.avatarUrl} initial={initial} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-950 dark:text-rose-100">
                      {member.nickname}
                    </p>
                  </div>
                  {member.userId === family.ownerUserId && (
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                        <Crown className="size-3" aria-hidden="true" />
                        Owner
                      </span>
                  )}
                  {canRemove && (
                      <button
                          type="button"
                          onClick={() => onRemove(member.userId)}
                          disabled={removingId === member.userId}
                          aria-label={`Remove ${member.nickname}`}
                          className="flex h-8 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                      >
                        <UserMinus className="size-3.5" aria-hidden="true" />
                        {removingId === member.userId ? "Removing..." : "Remove"}
                      </button>
                  )}
                </div>
            );
          })}
        </div>
      </section>
  );
}
