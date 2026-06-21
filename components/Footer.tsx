import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/5">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-8 text-center">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-zinc-400">
          <Link href="/" className="hover:text-white">upload</Link>
          <Link href="/gallery" className="hover:text-white">your files</Link>
          <Link href="/developers" className="hover:text-white">api</Link>
          <Link href="/faq" className="hover:text-white">faq</Link>
          <Link href="/terms" className="hover:text-white">terms</Link>
          <Link href="/privacy" className="hover:text-white">privacy</Link>
        </div>
        <p className="text-xs text-zinc-600">
          © {new Date().getFullYear()} Lumora.io — made with light &amp; a little
          bit of magic. 💫
        </p>
      </div>
    </footer>
  );
}
