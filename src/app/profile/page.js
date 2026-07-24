"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/api/user";
import { logout } from "@/api/auth";
import { PiggyMark, LogoutIcon, Spinner } from "@/components/icons";
import { GradientBackdrop } from "@/components/backdrop";
import styles from "@/components/animations.module.css";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await getCurrentUser();
        if (!cancelled) setUser(response.data);
      } catch (error) {
        // A 401 here is already handled by the request interceptor (redirect to /login).
        if (!cancelled && error.response?.status !== 401) {
          setLoadError(error.response?.data?.message ?? error.message ?? "Couldn't load your profile.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      // Even if the request fails, the local session is treated as ended.
    } finally {
      router.push("/login");
    }
  }

  const initial = user?.username?.[0]?.toUpperCase() ?? "?";

  return (
    <GradientBackdrop className="flex flex-1 flex-col font-sans">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
        <div className="mx-auto flex h-16 w-full max-w-2xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400">
              <PiggyMark className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-black dark:text-rose-100">
              PiggyMemo
            </span>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex h-9 items-center gap-1.5 rounded-full border border-zinc-200 px-3.5 text-sm font-medium text-zinc-600 transition-all duration-150 hover:border-zinc-300 hover:bg-zinc-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-rose-200 dark:hover:bg-zinc-900"
          >
            {loggingOut ? <Spinner className="h-3.5 w-3.5" /> : <LogoutIcon className="h-3.5 w-3.5" />}
            {loggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        {loading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-28 rounded-3xl bg-zinc-200/70 dark:bg-zinc-900" />
            <div className="h-40 rounded-3xl bg-zinc-200/70 dark:bg-zinc-900" />
          </div>
        ) : loadError ? (
          <div className={`${styles.fadeInUp} rounded-3xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950`}>
            <p className="text-sm text-rose-600 dark:text-rose-400">{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 h-10 rounded-full bg-rose-500 px-5 text-sm font-medium text-white transition-all duration-150 hover:bg-rose-600 active:scale-95"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className={`flex flex-col gap-6 ${styles.fadeInUp}`}>
            {/* Welcome card */}
            <div className="flex items-center gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-rose-500 text-lg font-semibold text-white">
                {initial}
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold tracking-tight text-black dark:text-rose-100">
                  Welcome back{user?.username ? `, ${user.username}` : ""}
                </h1>
                <p className="text-sm text-zinc-500 dark:text-rose-300/70">
                  Good to see you.
                </p>
              </div>
            </div>

            {/* Account details */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-rose-300/70">
                Account
              </h2>
              <dl className="divide-y divide-zinc-100 dark:divide-zinc-800">
                <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <dt className="text-sm text-zinc-500 dark:text-rose-300/70">Username</dt>
                  <dd className="text-sm font-medium text-black dark:text-rose-100">{user?.username ?? "—"}</dd>
                </div>
              </dl>
            </div>

            {/* Memos empty state */}
            <div className="rounded-3xl border border-dashed border-zinc-300 bg-white/60 p-8 text-center dark:border-zinc-700 dark:bg-zinc-950/40">
              <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <PiggyMark className="h-5 w-5" />
              </span>
              <p className="text-sm font-medium text-black dark:text-rose-100">No memos yet</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-rose-300/70">
                Memos you save will show up here.
              </p>
            </div>
          </div>
        )}
      </main>
    </GradientBackdrop>
  );
}