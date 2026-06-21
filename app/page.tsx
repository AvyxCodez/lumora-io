import Link from "next/link";
import { Uploader } from "@/components/Uploader";
import { Mascot } from "@/components/Mascot";

const MAX_MB = Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB) || 200;

const perks = [
  { emoji: "🚀", text: "no account, no waiting" },
  { emoji: "🔗", text: "clean direct links" },
  { emoji: "🕶️", text: "no ads, no tracking" },
  { emoji: "🎞️", text: "images · video · audio · files" },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-2xl px-4">
      {/* Banner */}
      <section className="animate-fade-up pt-10 sm:pt-14">
        <div className="glass relative overflow-hidden rounded-3xl px-6 py-8 shadow-glow">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-aura-500/20 blur-3xl" />
          <div className="relative flex items-center gap-5">
            <Mascot size={96} className="shrink-0 drop-shadow-[0_0_25px_rgba(124,69,255,0.4)]" />
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                <span className="text-gradient">Lumora</span>
              </h1>
              <p className="mt-1 text-sm text-zinc-400 sm:text-base">
                a cozy little home for your files. drop something and get a
                link — that&apos;s the whole thing. ✨
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Uploader */}
      <section id="upload" className="animate-fade-up mt-6 scroll-mt-24">
        <div className="glass rounded-3xl p-3 shadow-glow sm:p-4">
          <Uploader />
        </div>
      </section>

      {/* Perks strip */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {perks.map((p) => (
          <div
            key={p.text}
            className="glass flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs text-zinc-300"
          >
            <span className="text-base">{p.emoji}</span>
            <span className="leading-tight">{p.text}</span>
          </div>
        ))}
      </section>

      {/* Friendly footer note */}
      <section className="mt-8 text-center text-sm text-zinc-500">
        <p>
          up to <span className="text-zinc-300">{MAX_MB} MB</span> per file ·
          temporary uploads self-destruct on schedule ·{" "}
          <Link href="/faq" className="text-aura-300 hover:underline">
            got questions?
          </Link>
        </p>
        <p className="mt-2 text-xs text-zinc-600">
          be cool — don&apos;t upload anything illegal or gross. 💜
        </p>
      </section>
    </div>
  );
}
