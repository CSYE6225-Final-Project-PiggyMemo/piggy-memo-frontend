"use client";

import styles from "./animations.module.css";

export function LoadErrorCard({ message }) {
  return (
    <div
      className={`${styles.fadeInUp} rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950`}
    >
      <p className="text-sm text-rose-600 dark:text-rose-400">{message}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-4 h-10 rounded-full bg-rose-500 px-5 text-sm font-medium text-white transition hover:bg-rose-600 active:scale-95"
      >
        Try again
      </button>
    </div>
  );
}
