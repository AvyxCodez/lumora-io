import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Lumora",
};

const sections = [
  {
    title: "the basics",
    body: "Lumora is a free file hosting service. By uploading anything to Lumora you agree to these terms. If you don't agree, please don't use the service. We reserve the right to update these terms at any time — continued use means you accept the changes.",
  },
  {
    title: "what you can upload",
    body: "Pretty much anything legal and non-harmful — images, video, audio, PDFs, archives, and more. We block executables (.exe, .scr, .cpl, .jar) and Word documents by default. Everything else goes through as long as it's within the size limit.",
  },
  {
    title: "what you cannot upload",
    body: "No content that is illegal under applicable law. No CSAM — ever, zero tolerance. No malware, spyware, or anything designed to harm systems or people. No content that violates someone else's copyright or intellectual property rights. Violating this gets your files removed immediately and may be reported to relevant authorities.",
  },
  {
    title: "your files, your links",
    body: "Files are accessible to anyone who has the link. Links are short, random, and unguessable — but they are not private in a cryptographic sense. Don't upload anything you wouldn't be comfortable with a stranger stumbling upon via a shared link.",
  },
  {
    title: "dmca & takedowns",
    body: "If you believe content hosted on Lumora infringes your copyright, contact us with the relevant link and we'll remove it promptly. We respond to valid DMCA requests. Repeated infringers will have their content removed.",
  },
  {
    title: "temporary files",
    body: "Files uploaded with an expiry are automatically deleted when the timer runs out. Permanent files stay up indefinitely unless deleted by the uploader or removed by us for a terms violation.",
  },
  {
    title: "no guarantees",
    body: "Lumora is provided as-is, free of charge. We do our best to keep it fast and reliable, but we make no guarantees about uptime, data durability, or availability. Don't use Lumora as your only backup for important files.",
  },
  {
    title: "termination",
    body: "We reserve the right to remove any file or restrict access to the service at any time, for any reason, without notice. Especially if you're doing something sketchy.",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-16 pb-24">
      {/* Header */}
      <div className="glass relative overflow-hidden rounded-3xl px-8 py-10 shadow-glow">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-aura-500/20 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-medium uppercase tracking-widest text-aura-400">Legal</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Terms of <span className="text-gradient">Service</span>
          </h1>
          <p className="mt-3 text-zinc-400">
            Plain-english rules for using Lumora. Last updated{" "}
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

      {/* Footer note */}
      <p className="mt-8 text-center text-xs text-zinc-600">
        questions? reach out before anything else. we&apos;re reasonable people. 🤝
      </p>
    </div>
  );
}
