/**
 * "Lumi" — Lumora's mascot. A friendly glowing aura wisp.
 * Intentionally its own character (not a cat) — playful, on-brand with the
 * light/aura theme.
 */
export function Mascot({
  className = "",
  size = 120,
  float = true,
}: {
  className?: string;
  size?: number;
  float?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={`${float ? "animate-float" : ""} ${className}`}
      role="img"
      aria-label="Lumi, the Lumora mascot"
    >
      <defs>
        <radialGradient id="lumi-glow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lumi-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#efeaff" />
          <stop offset="55%" stopColor="#cfc0ff" />
          <stop offset="100%" stopColor="#a987ff" />
        </linearGradient>
        <linearGradient id="lumi-spark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#c4b5ff" />
        </linearGradient>
      </defs>

      {/* soft aura glow */}
      <circle cx="60" cy="58" r="52" fill="url(#lumi-glow)" />

      {/* body — a cozy wisp */}
      <path
        d="M60 14C39 14 26 31 26 56V88c0 5 6 7 9 3l4-5c2-2 5-2 7 0l4 5c2 2 5 2 7 0l4-5c2-2 5-2 7 0l4 5c3 4 11 2 11-3V56C94 31 81 14 60 14Z"
        fill="url(#lumi-body)"
        stroke="#b9a3ff"
        strokeOpacity="0.5"
        strokeWidth="1.5"
      />

      {/* cheeks */}
      <ellipse cx="43" cy="62" rx="5" ry="3.2" fill="#ff9ad5" opacity="0.55" />
      <ellipse cx="77" cy="62" rx="5" ry="3.2" fill="#ff9ad5" opacity="0.55" />

      {/* eyes */}
      <ellipse cx="49" cy="53" rx="3" ry="4.4" fill="#2a1b4a" />
      <ellipse cx="71" cy="53" rx="3" ry="4.4" fill="#2a1b4a" />
      <circle cx="50.2" cy="51.2" r="1.1" fill="#fff" />
      <circle cx="72.2" cy="51.2" r="1.1" fill="#fff" />

      {/* smile */}
      <path
        d="M54 61c3 3.5 9 3.5 12 0"
        fill="none"
        stroke="#2a1b4a"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* orbiting sparkles */}
      <g transform="translate(99 30) scale(6)">
        <path d="M0 -1C0 -0.3 0.3 0 1 0C0.3 0 0 0.3 0 1C0 0.3 -0.3 0 -1 0C-0.3 0 0 -0.3 0 -1Z" fill="url(#lumi-spark)" />
      </g>
      <g transform="translate(20 40) scale(4)">
        <path d="M0 -1C0 -0.3 0.3 0 1 0C0.3 0 0 0.3 0 1C0 0.3 -0.3 0 -1 0C-0.3 0 0 -0.3 0 -1Z" fill="url(#lumi-spark)" />
      </g>
      <g transform="translate(94 80) scale(3)">
        <path d="M0 -1C0 -0.3 0.3 0 1 0C0.3 0 0 0.3 0 1C0 0.3 -0.3 0 -1 0C-0.3 0 0 -0.3 0 -1Z" fill="url(#lumi-spark)" />
      </g>
    </svg>
  );
}
