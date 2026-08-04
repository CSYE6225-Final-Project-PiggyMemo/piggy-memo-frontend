"use client";

import styles from "./animations.module.css";

export function Modal({ onClose, labelledBy, maxWidth = "max-w-md", children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`${styles.popIn} w-full ${maxWidth} rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950`}
      >
        {children}
      </div>
    </div>
  );
}
