import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Lumora — a cozy home for your files";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Lumi, rendered into the share card.
const mascotSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
<defs>
<radialGradient id="g" cx="50%" cy="45%" r="55%"><stop offset="0%" stop-color="#a78bfa" stop-opacity="0.55"/><stop offset="100%" stop-color="#a78bfa" stop-opacity="0"/></radialGradient>
<linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#efeaff"/><stop offset="55%" stop-color="#cfc0ff"/><stop offset="100%" stop-color="#a987ff"/></linearGradient>
<linearGradient id="s" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fff"/><stop offset="100%" stop-color="#c4b5ff"/></linearGradient>
</defs>
<circle cx="60" cy="58" r="52" fill="url(#g)"/>
<path d="M60 14C39 14 26 31 26 56V88c0 5 6 7 9 3l4-5c2-2 5-2 7 0l4 5c2 2 5 2 7 0l4-5c2-2 5-2 7 0l4 5c3 4 11 2 11-3V56C94 31 81 14 60 14Z" fill="url(#b)" stroke="#b9a3ff" stroke-opacity="0.5" stroke-width="1.5"/>
<ellipse cx="43" cy="62" rx="5" ry="3.2" fill="#ff9ad5" opacity="0.55"/><ellipse cx="77" cy="62" rx="5" ry="3.2" fill="#ff9ad5" opacity="0.55"/>
<ellipse cx="49" cy="53" rx="3" ry="4.4" fill="#2a1b4a"/><ellipse cx="71" cy="53" rx="3" ry="4.4" fill="#2a1b4a"/>
<circle cx="50.2" cy="51.2" r="1.1" fill="#fff"/><circle cx="72.2" cy="51.2" r="1.1" fill="#fff"/>
<path d="M54 61c3 3.5 9 3.5 12 0" fill="none" stroke="#2a1b4a" stroke-width="2" stroke-linecap="round"/>
<g transform="translate(99 30) scale(6)"><path d="M0 -1C0 -0.3 0.3 0 1 0C0.3 0 0 0.3 0 1C0 0.3 -0.3 0 -1 0C-0.3 0 0 -0.3 0 -1Z" fill="url(#s)"/></g>
<g transform="translate(20 40) scale(4)"><path d="M0 -1C0 -0.3 0.3 0 1 0C0.3 0 0 0.3 0 1C0 0.3 -0.3 0 -1 0C-0.3 0 0 -0.3 0 -1Z" fill="url(#s)"/></g>
</svg>`;

const mascot = `data:image/svg+xml,${encodeURIComponent(mascotSvg)}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 56,
          background:
            "radial-gradient(circle at 30% 20%, #1a1140 0%, #06060a 60%)",
          color: "white",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mascot} width={300} height={300} alt="" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 120,
              fontWeight: 700,
              letterSpacing: -3,
              backgroundImage: "linear-gradient(120deg, #ffffff, #b9a3ff)",
              backgroundClip: "text",
              color: "transparent",
              lineHeight: 1,
            }}
          >
            Lumora
          </div>
          <div style={{ fontSize: 38, color: "#a79fc0", marginTop: 20 }}>
            drop it · share it · done ✨
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 36,
              fontSize: 26,
              color: "#d6caff",
              border: "1px solid rgba(124,69,255,0.4)",
              background: "rgba(124,69,255,0.12)",
              padding: "10px 22px",
              borderRadius: 999,
            }}
          >
            free image · video · audio &amp; file hosting
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
