import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Lumora",
};

const MAX_MB = Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB) || 200;

const faqs = [
  {
    q: "what is this?",
    a: "Lumora is a free, no-fuss file host for images, video, audio and documents. Drop a file, get a clean shareable link. No account, no drama. ✨",
  },
  {
    q: "keep forever vs. temporary?",
    a: "By default your file sticks around forever. Flip to 'Temporary' and pick 1 hour, 12 hours, 1 day or 3 days — when the timer's up, Lumi quietly sweeps it away.",
  },
  {
    q: "how big can my files be?",
    a: `Up to ${MAX_MB} MB each. Drag in a whole pile at once and they'll all upload together.`,
  },
  {
    q: "what can i upload?",
    a: "Pretty much anything — images, video, audio, PDFs, archives, you name it. The only things we turn away are .exe, .scr, .cpl, .jar and Word documents (.doc/.docx). And nothing illegal or harmful, please.",
  },
  {
    q: "can i delete something i uploaded?",
    a: "Yep. Every upload gets a private delete link, and there's a 🗑 button on each file in 'your files' and right after you upload. Deleting is instant and permanent.",
  },
  {
    q: "who can see my uploads?",
    a: "Only people with the link. Links are short and unguessable, and your 'your files' page lives only in your browser — it's not a public feed.",
  },
  {
    q: "can i hotlink / embed?",
    a: "Absolutely. Every link is a direct URL you can drop into forums, Discord, your site, wherever.",
  },
  {
    q: "is there an api?",
    a: "Yep — POST a multipart form with a 'file' field (and optional 'expires' = 1h/12h/24h/72h) to /api/upload, and you'll get JSON back with your link.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Frequently asked <span className="text-gradient">questions</span>
      </h1>
      <p className="mt-3 text-zinc-400">Everything you might want to know about Lumora.</p>

      <div className="mt-10 space-y-4">
        {faqs.map((f) => (
          <details
            key={f.q}
            className="glass glass-hover group rounded-2xl p-5 [&_summary]:cursor-pointer"
          >
            <summary className="flex list-none items-center justify-between text-base font-medium text-white">
              {f.q}
              <span className="ml-4 text-aura-300 transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
