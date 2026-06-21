"use client";

import { useEffect, useState } from "react";

type GhostInstance = {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  flip: boolean;
};

function GhostSVG({ size, opacity }: { size: number; opacity: number }) {
  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 60 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      {/* Body */}
      <path
        d="M5 30C5 15.64 16.64 4 31 4C45.36 4 57 15.64 57 30V66L49.5 60L42 66L34.5 60L27 66L19.5 60L12 66L5 60V30Z"
        fill="white"
        fillOpacity="0.18"
      />
      <path
        d="M5 30C5 15.64 16.64 4 31 4C45.36 4 57 15.64 57 30V66L49.5 60L42 66L34.5 60L27 66L19.5 60L12 66L5 60V30Z"
        stroke="white"
        strokeOpacity="0.35"
        strokeWidth="2"
      />
      {/* Eyes */}
      <ellipse cx="22" cy="32" rx="5" ry="6" fill="white" fillOpacity="0.7" />
      <ellipse cx="40" cy="32" rx="5" ry="6" fill="white" fillOpacity="0.7" />
      <ellipse cx="23" cy="33" rx="2.5" ry="3" fill="#1a1a2e" />
      <ellipse cx="41" cy="33" rx="2.5" ry="3" fill="#1a1a2e" />
    </svg>
  );
}

export function Ghost() {
  const [ghosts, setGhosts] = useState<GhostInstance[]>([]);

  useEffect(() => {
    const instances: GhostInstance[] = [
      { id: 1, x: 8,  y: 20, size: 52, duration: 6,  delay: 0,   flip: false },
      { id: 2, x: 78, y: 55, size: 38, duration: 8,  delay: 2.5, flip: true  },
      { id: 3, x: 55, y: 10, size: 28, duration: 7,  delay: 1,   flip: false },
    ];
    setGhosts(instances);
  }, []);

  return (
    <>
      {ghosts.map((g) => (
        <div
          key={g.id}
          className="ghost-float pointer-events-none fixed z-0 select-none"
          style={{
            left: `${g.x}vw`,
            top: `${g.y}vh`,
            "--ghost-dur": `${g.duration}s`,
            "--ghost-delay": `${g.delay}s`,
            transform: g.flip ? "scaleX(-1)" : undefined,
          } as React.CSSProperties}
        >
          <GhostSVG size={g.size} opacity={0.28} />
        </div>
      ))}
    </>
  );
}
