import { registraInfoType } from "@/lib/RegistraCheck";
import styles from "../register.module.css";

// Status text colors keyed off the existing Info type enum.
// Presentation only — the enum + logic that produces these values live in
// src/hooks/useRegistraCheck.ts and are untouched.
const STATUS_STYLES = {
  [registraInfoType.EMPTY]: "",
  [registraInfoType.VALIDATING]: "text-zinc-500 dark:text-zinc-400",
  [registraInfoType.WARNING]: "text-rose-600 dark:text-rose-400",
  [registraInfoType.AVAILABLE]: "text-emerald-600 dark:text-emerald-400",
};

export function Field({ label, htmlFor, children, info }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
      >
        {label}
      </label>
      {children}
      {info?.message && (
        <p
          key={info.message}
          className={`min-h-[1.1rem] ${styles.fadeInDown} text-xs ${STATUS_STYLES[info.type]}`}
        >
          {info.message}
        </p>
      )}
    </div>
  );
}

export const inputClass =
  "h-11 w-full rounded-full border border-zinc-300 bg-white px-4 text-sm text-black " +
  "transition-all duration-150 placeholder:text-zinc-400 " +
  "focus:scale-[1.01] focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 " +
  "dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 " +
  "dark:focus:ring-rose-900/40";