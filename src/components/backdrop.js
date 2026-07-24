// Shared background treatment for login, register, and profile.
// Corner blobs use fixed positioning so they always sit at the viewport
// corners regardless of how tall the page content is.

export function GradientBackdrop({ className = "", children }) {
  return (
    <div
      className={
        "relative bg-gradient-to-b from-rose-50 via-zinc-50 to-white " +
        "dark:from-zinc-950 dark:via-black dark:to-black " +
        className
      }
    >
      {/* Top-left — light */}
      <div className="pointer-events-none fixed -left-24 -top-24 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl z-0 dark:hidden" />
      {/* Top-left — dark */}
      <div className="pointer-events-none fixed -left-32 -top-32 h-96 w-96 rounded-full bg-rose-500/35 blur-[120px] z-0 hidden dark:block" />

      {/* Top-right — light */}
      <div className="pointer-events-none fixed -right-24 -top-24 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl z-0 dark:hidden" />
      {/* Top-right — dark */}
      <div className="pointer-events-none fixed -right-32 -top-32 h-96 w-96 rounded-full bg-amber-500/28 blur-[120px] z-0 hidden dark:block" />

      {/* Bottom-left — light */}
      <div className="pointer-events-none fixed -left-24 -bottom-24 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl z-0 dark:hidden" />
      {/* Bottom-left — dark */}
      <div className="pointer-events-none fixed -left-32 -bottom-32 h-96 w-96 rounded-full bg-amber-500/28 blur-[120px] z-0 hidden dark:block" />

      {/* Bottom-right — light */}
      <div className="pointer-events-none fixed -right-24 -bottom-24 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl z-0 dark:hidden" />
      {/* Bottom-right — dark */}
      <div className="pointer-events-none fixed -right-32 -bottom-32 h-96 w-96 rounded-full bg-rose-500/35 blur-[120px] z-0 hidden dark:block" />
      <div className="relative z-10 flex flex-col" style={{minHeight: "inherit"}}>
        {children}
      </div>
    </div>
  );
}