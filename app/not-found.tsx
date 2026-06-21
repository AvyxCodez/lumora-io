import Link from "next/link";
import { Mascot } from "@/components/Mascot";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 pt-24 text-center">
      <Mascot size={120} />
      <h1 className="mt-6 text-4xl font-semibold tracking-tight">
        <span className="text-gradient">404</span>
      </h1>
      <p className="mt-2 text-zinc-400">
        Lumi looked everywhere — this one&apos;s gone or never existed.
      </p>
      <p className="mt-1 text-sm text-zinc-600">
        (temporary uploads vanish when their timer runs out.)
      </p>
      <Link
        href="/"
        className="mt-7 inline-flex rounded-xl bg-gradient-to-r from-aura-500 to-aura-700 px-6 py-3 text-sm font-medium text-white shadow-glow-sm transition-transform hover:scale-[1.03] active:scale-95"
      >
        back home
      </Link>
    </div>
  );
}
