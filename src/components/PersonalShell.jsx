"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/api/auth";
import { GradientBackdrop } from "@/components/backdrop";
import { LogoutIcon, PiggyMark, Spinner } from "@/components/icons";
import PersonalSidebar from "@/components/PersonalSidebar";

export default function PersonalShell({
    activePath,
    children,
    className = "",
}) {
    const router = useRouter();
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);

    async function handleLogout() {
        setLoggingOut(true);
        try {
            await logout();
        } catch {
            // Clear the local session even if the server is already unavailable.
        }
        router.push("/login");
    }

    return (
        <GradientBackdrop className="flex flex-1 flex-col font-sans">
            <PersonalSidebar
                activePath={activePath}
                expanded={sidebarExpanded}
                onExpandedChange={setSidebarExpanded}
            />

            <div
                className={[
                    "flex min-h-screen flex-1 flex-col",
                    "transition-[padding-left] duration-200 ease-out",
                    sidebarExpanded ? "pl-60" : "pl-[72px]",
                    className,
                ].join(" ")}
            >
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
                            type="button"
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="flex h-9 items-center gap-1.5 rounded-full border border-zinc-200 px-3.5 text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-100 active:scale-95 disabled:opacity-60 dark:border-zinc-700 dark:text-rose-200 dark:hover:bg-zinc-900"
                        >
                            {loggingOut ? (
                                <Spinner className="h-3.5 w-3.5" />
                            ) : (
                                <LogoutIcon className="h-3.5 w-3.5" />
                            )}
                            {loggingOut ? "Logging out..." : "Log out"}
                        </button>
                    </div>
                </header>

                {children}
            </div>
        </GradientBackdrop>
    );
}
