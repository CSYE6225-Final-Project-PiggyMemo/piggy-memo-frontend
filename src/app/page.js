import { PiggyMark } from "@/components/icons";
import { GradientBackdrop } from "@/components/backdrop";
import styles from "@/components/animations.module.css";

export default function Home() {
  return (
    <GradientBackdrop className="flex flex-1 items-center justify-center px-4 py-16 font-sans">
      <div className={`relative flex w-full max-w-sm flex-col items-center text-center ${styles.fadeInUp}`}>
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400">
          <PiggyMark className="h-9 w-9" />
        </span>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-black dark:text-rose-100">
          PiggyMemo
        </h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-500 dark:text-rose-300/70">
          Track your spending, set budgets, and manage money together with your family — all in one place.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3">
          <a
            href="/register"
            className="flex h-11 w-full items-center justify-center rounded-full bg-rose-500 text-sm font-medium text-white transition-all duration-150 hover:scale-[1.02] hover:bg-rose-600 active:scale-95"
          >
            Get started
          </a>
          <a
            href="/login"
            className="flex h-11 w-full items-center justify-center rounded-full border border-zinc-200 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-100 active:scale-95 dark:border-zinc-700 dark:text-rose-200 dark:hover:bg-zinc-900"
          >
            Log in
          </a>
        </div>
      </div>
    </GradientBackdrop>
  );
}
