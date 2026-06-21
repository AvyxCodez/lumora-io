import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Lumora",
};

const sections = [
  {
    title: "the short version",
    body: "We collect as little as possible. No accounts, no tracking pixels, no ad networks. Your upload history lives only in your own browser — we never see it.",
  },
  {
    title: "what we store",
    body: "When you upload a file, we store the file itself along with some metadata: the original filename, file type, size, upload timestamp, and an optional expiry time. That's it. We do not store your IP address alongside files in any persistent way.",
  },
  {
    title: "your browser's local storage",
    body: "The 'your files' gallery is built entirely from your browser's localStorage. That list never leaves your device and is never sent to our servers. Clearing your browser data or switching devices will clear the list — but your files stay online through their links.",
  },
  {
    title: "cookies",
    body: "We don't set any tracking or advertising cookies. The only storage we use client-side is localStorage for your upload history (see above).",
  },
  {
    title: "third-party services",
    body: "Files are stored on Cloudflare R2 object storage, served through Cloudflare's CDN. Cloudflare may log access requests as part of their infrastructure. We use Railway to run the application server. Neither service receives your personal information beyond what's technically necessary to serve requests.",
  },
  {
    title: "who can see your files",
    body: "Anyone with the link. We don't publish a public feed of uploads. Links are short random strings — unguessable in practice, but not encrypted. Treat every link as semi-public.",
  },
  {
    title: "data retention",
    body: "Permanent files stay stored until you delete them or we remove them for a terms violation. Temporary files are deleted automatically when their timer expires. We don't keep backups of deleted files.",
  },
  {
    title: "your rights",
    body: "You can delete any file you uploaded at any time using the delete button or your delete link. Since we don't collect personal accounts, there's nothing else to request deletion of on our end.",
  },
  {
    title: "changes to this policy",
    body: "We may update this policy from time to time. The date at the top of the page reflects when it was last changed. Continued use of Lumora after a change means you accept the updated policy.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-16 pb-24">
      {/* Header */}
      <div className="glass relative overflow-hidden rounded-3xl px-8 py-10 shadow-glow">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-aura-500/20 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-medium uppercase tracking-widest text-aura-400">Legal</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Privacy <span className="text-gradient">Policy</span>
          </h1>
          <p className="mt-3 text-zinc-400">
            We keep it simple — your data, your control. Last updated{" "}
            <span className="text-zinc-300">June 2026</span>.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="mt-6 space-y-3">
        {sections.map((s) => (
          <div key={s.title} className="glass rounded-2xl px-6 py-5">
            <h2 className="text-base font-semibold text-white">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{s.body}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-zinc-600">
        no legalese, no surprises. that&apos;s the whole point. 🔒
      </p>
    </div>
  );
}
