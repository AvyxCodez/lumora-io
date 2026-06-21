export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="relative grid h-8 w-8 place-items-center">
        <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
          <defs>
            <linearGradient id="lum-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c4b5ff" />
              <stop offset="55%" stopColor="#7c45ff" />
              <stop offset="100%" stopColor="#3864ff" />
            </linearGradient>
          </defs>
          <circle cx="16" cy="16" r="13" fill="url(#lum-g)" opacity="0.18" />
          <path
            d="M16 4.5c-2 5-3.5 7-8.5 9 5 2 6.5 4 8.5 9 2-5 3.5-7 8.5-9-5-2-6.5-4-8.5-9z"
            fill="url(#lum-g)"
          />
        </svg>
        <span className="absolute inset-0 -z-10 rounded-full bg-aura-500/40 blur-md" />
      </span>
      <span className="text-lg font-semibold tracking-tight text-white">
        Lumora
      </span>
    </span>
  );
}
