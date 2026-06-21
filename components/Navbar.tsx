import Link from "next/link";
import { Logo } from "./Logo";

const links = [
  { href: "/", label: "upload" },
  { href: "/gallery", label: "your files" },
  { href: "/developers", label: "api" },
  { href: "/faq", label: "faq" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50">
      <div className="mx-auto mt-4 max-w-3xl px-4">
        <nav className="glass flex items-center justify-between rounded-2xl px-4 py-2.5">
          <Link href="/" className="shrink-0">
            <Logo />
          </Link>

          <div className="flex items-center gap-0.5 text-xs sm:gap-1 sm:text-sm">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-2 py-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white sm:px-3"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
