"use client";

const VARIANT_STYLES = {
  primary:
    "bg-rose-500 text-white hover:bg-rose-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500",
  secondary:
    "border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-rose-200 dark:hover:bg-zinc-900",
  danger:
    "text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30",
};

const SIZE_STYLES = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-5 text-sm",
  lg: "h-11 px-5 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  type = "button",
  className = "",
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={[
        "flex items-center justify-center gap-1.5 rounded-full font-medium transition-all active:scale-95",
        "disabled:cursor-not-allowed disabled:opacity-60",
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
