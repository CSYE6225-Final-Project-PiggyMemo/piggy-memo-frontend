// Lightweight inline icons so we don't need to add an icon library dependency
// just for a handful of glyphs.

export function PiggyMark({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4.5 12.5c0-3.6 3.36-6.5 7.5-6.5 3.1 0 5.77 1.63 6.93 3.97.3-.1.63-.16 1-.16.9 0 1.63.62 1.87 1.44a.5.5 0 0 1-.48.63h-1.1c-.14.62-.4 1.2-.75 1.72V16a1 1 0 0 1-1 1h-1.4a1 1 0 0 1-.97-.76l-.14-.57a10.9 10.9 0 0 1-3.46.55c-1.2 0-2.36-.19-3.42-.55l-.14.57A1 1 0 0 1 8.07 17H6.5a1 1 0 0 1-1-1v-.9A6.13 6.13 0 0 1 4.5 12.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="8.6" cy="12" r="0.9" fill="currentColor" />
      <path d="M11 6.2V4.6m0 0h-1.6M11 4.6h1.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9.2 9.6h3.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function EyeIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function EyeOffIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 5.7A10.6 10.6 0 0 1 12 5.5c6.4 0 10 6.5 10 6.5a15.6 15.6 0 0 1-3.4 4.1M6.6 6.6C4 8.3 2 12 2 12s3.6 6.5 10 6.5c1.4 0 2.66-.28 3.77-.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.9 10.1a2.75 2.75 0 0 0 3.95 3.85"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Spinner({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`animate-spin ${className}`} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}