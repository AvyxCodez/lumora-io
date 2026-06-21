"use client";

import { useState } from "react";
import Link from "next/link";

export function DeleteConfirm({
  id,
  token,
  name,
}: {
  id: string;
  token: string;
  name: string;
}) {
  const [state, setState] = useState<"idle" | "deleting" | "done" | "error">("idle");

  const del = async () => {
    setState("deleting");
    try {
      const res = await fetch("/api/files/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, token }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="text-center">
        <p className="text-lg font-medium text-white">Poof — it&apos;s gone. ✨</p>
        <p className="mt-2 text-sm text-zinc-400">
          {name} has been permanently deleted.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-aura-500 to-aura-700 px-6 py-2.5 text-sm font-medium text-white shadow-glow-sm transition-transform hover:scale-[1.03]"
        >
          back home
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-zinc-300">
        Delete <span className="font-medium text-white">{name}</span>?
      </p>
      <p className="mt-1 text-sm text-zinc-500">This can&apos;t be undone.</p>

      {state === "error" && (
        <p className="mt-4 text-sm text-red-400">
          Couldn&apos;t delete that — the link may be invalid.
        </p>
      )}

      <div className="mt-6 flex items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/5"
        >
          keep it
        </Link>
        <button
          onClick={del}
          disabled={state === "deleting"}
          className="rounded-xl bg-red-500/90 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-60"
        >
          {state === "deleting" ? "deleting…" : "delete forever"}
        </button>
      </div>
    </div>
  );
}
