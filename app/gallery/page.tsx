"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatBytes, kindFromType, timeAgo } from "@/lib/format";
import { expiresInLabel } from "@/lib/expiry";
import {
  getHistory,
  onHistoryChange,
  deleteUpload,
  clearHistory,
  type HistoryItem,
} from "@/lib/history";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Mascot } from "@/components/Mascot";

const isExpired = (f: HistoryItem) =>
  f.expiresAt != null && Date.now() > f.expiresAt;

export default function GalleryPage() {
  const [files, setFiles] = useState<HistoryItem[]>([]);
  const [ready, setReady] = useState(false);
  const [origin, setOrigin] = useState("");
  const [active, setActive] = useState<HistoryItem | null>(null);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HistoryItem | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
    const sync = () => setFiles(getHistory().filter((f) => !isExpired(f)));
    sync();
    setReady(true);
    return onHistoryChange(sync);
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 sm:pt-14">

      {/* Header banner — always visible */}
      <section className="animate-fade-up">
        <div className="glass relative overflow-hidden rounded-3xl px-6 py-7 shadow-glow">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-aura-500/20 blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <Mascot size={72} className="shrink-0 drop-shadow-[0_0_20px_rgba(124,69,255,0.4)]" />
              <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Your <span className="text-gradient">uploads</span>
                </h1>
                <p className="mt-1 text-sm text-zinc-400">
                  Private to this browser · files stay reachable through their links
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {files.length > 0 && (
                <button
                  onClick={() => setClearConfirm(true)}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/5"
                >
                  Clear list
                </button>
              )}
              <Link
                href="/#upload"
                className="rounded-xl bg-gradient-to-r from-aura-500 to-aura-700 px-5 py-2.5 text-sm font-medium text-white shadow-glow-sm transition-transform hover:scale-[1.03]"
              >
                Upload a file
              </Link>
            </div>
          </div>
        </div>
      </section>

      {!ready ? (
        <div className="glass mt-6 overflow-hidden rounded-2xl">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-t border-white/5 px-4 py-3 first:border-t-0"
            >
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-ink-800/70" />
              <div className="h-3 w-40 animate-pulse rounded bg-ink-800/70" />
              <div className="ml-auto h-3 w-24 animate-pulse rounded bg-ink-800/70" />
            </div>
          ))}
        </div>
      ) : files.length === 0 ? (
        <section className="animate-fade-up mt-6 grid gap-4 sm:grid-cols-3">
          {/* Empty state hero */}
          <div className="glass col-span-full rounded-3xl p-12 text-center shadow-glow">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-aura-500/30 to-aura-700/20 ring-1 ring-aura-500/30">
              <svg className="h-7 w-7 text-aura-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7h18M3 12h18M3 17h18" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-white">nothing here yet</p>
            <p className="mt-2 text-sm text-zinc-400">
              drop your first file and it'll show up right here, just for you.
            </p>
            <Link
              href="/#upload"
              className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-aura-500 to-aura-700 px-6 py-2.5 text-sm font-medium text-white shadow-glow-sm transition-transform hover:scale-[1.03]"
            >
              drop something ✨
            </Link>
          </div>

          {/* Feature pills */}
          {[
            { emoji: "🔒", title: "stays private", desc: "only visible in this browser" },
            { emoji: "🔗", title: "links live on", desc: "even if you clear this list" },
            { emoji: "💣", title: "self-destructs", desc: "set an expiry when uploading" },
          ].map((f) => (
            <div key={f.title} className="glass flex items-start gap-3 rounded-2xl px-5 py-4">
              <span className="mt-0.5 text-2xl">{f.emoji}</span>
              <div>
                <p className="text-sm font-medium text-white">{f.title}</p>
                <p className="text-xs text-zinc-400">{f.desc}</p>
              </div>
            </div>
          ))}
        </section>
      ) : (
        <div className="glass mt-6 overflow-hidden rounded-2xl">
          <div className="hidden items-center gap-3 border-b border-white/10 px-4 py-2.5 text-[11px] uppercase tracking-wide text-zinc-500 sm:flex">
            <span className="w-10 shrink-0" />
            <span className="flex-1">Name</span>
            <span className="w-16">Type</span>
            <span className="w-20 text-right">Size</span>
            <span className="w-20 text-right">Added</span>
            <span className="w-[88px] text-right">Actions</span>
          </div>
          {files.map((f) => (
            <Row key={f.id} file={f} origin={origin} onOpen={setActive} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      {active && (
        <Lightbox file={active} origin={origin} onClose={() => setActive(null)} />
      )}

      <ConfirmDialog
        open={clearConfirm}
        title="Clear history?"
        message="Files stay online — you just lose the local list on this device."
        confirmLabel="Clear"
        onConfirm={() => { setClearConfirm(false); clearHistory(); }}
        onCancel={() => setClearConfirm(false)}
      />
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete file?"
        message={`"${deleteTarget?.originalName}" will be permanently deleted and the link will stop working.`}
        confirmLabel="Delete"
        onConfirm={() => { if (deleteTarget) deleteUpload(deleteTarget); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function Lightbox({
  file,
  origin,
  onClose,
}: {
  file: HistoryItem;
  origin: string;
  onClose: () => void;
}) {
  const url = `${origin}/f/${file.name}`;
  const kind = kindFromType(file.type);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={file.originalName}
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-8"
    >
      <button
        onClick={onClose}
        title="Close (Esc)"
        aria-label="Close"
        className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-xl text-zinc-200 transition-colors hover:bg-white/20 hover:text-white"
      >
        ✕
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-full max-w-5xl flex-col items-center gap-4"
      >
        {kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={file.originalName}
            className="max-h-[78vh] w-auto max-w-full rounded-2xl object-contain shadow-glow-sm"
          />
        ) : kind === "video" ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            src={url}
            controls
            autoPlay
            className="max-h-[78vh] w-auto max-w-full rounded-2xl"
          />
        ) : (
          <div className="glass grid h-48 w-72 place-items-center rounded-2xl text-aura-300/70">
            <span className="text-4xl font-semibold uppercase">
              {file.ext?.replace(".", "") || "file"}
            </span>
          </div>
        )}

        <div className="flex items-center gap-3 text-sm text-zinc-300">
          <span className="max-w-[60vw] truncate font-medium text-white">
            {file.originalName}
          </span>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-aura-500/20"
          >
            Open original ↗
          </a>
        </div>
      </div>
    </div>
  );
}

/** Tint (icon color + soft background) used for each file kind's thumbnail. */
const KIND_TINT: Record<string, { bg: string; fg: string }> = {
  image: { bg: "rgba(139,127,240,.16)", fg: "#b9b1f7" },
  video: { bg: "rgba(93,202,165,.16)", fg: "#7ddcc0" },
  audio: { bg: "rgba(237,147,177,.16)", fg: "#f0a9c0" },
  file: { bg: "rgba(180,178,169,.16)", fg: "#cfcdc4" },
};

function Row({
  file,
  origin,
  onOpen,
  onDelete,
}: {
  file: HistoryItem;
  origin: string;
  onOpen: (f: HistoryItem) => void;
  onDelete: (f: HistoryItem) => void;
}) {
  const [copied, setCopied] = useState(false);
  const url = `${origin}/f/${file.name}`;
  const kind = kindFromType(file.type);
  const previewable = kind === "image" || kind === "video";
  const tint = KIND_TINT[kind] ?? KIND_TINT.file;
  const expiry = expiresInLabel(file.expiresAt);

  const copy = async (e: React.MouseEvent) => {
    e.preventDefault();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const open = (e: React.MouseEvent) => {
    // Previewable files open in the in-page lightbox; modified clicks
    // (ctrl/cmd/middle) still open the raw file in a new tab.
    if (previewable && !e.metaKey && !e.ctrlKey && e.button === 0) {
      e.preventDefault();
      onOpen(file);
    }
  };

  return (
    <div className="group flex items-center gap-3 border-t border-white/5 px-3 py-2.5 transition-colors first:border-t-0 hover:bg-white/[0.03] sm:px-4">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        onClick={open}
        title={previewable ? "Preview" : "Open"}
        className="relative h-10 w-10 shrink-0 cursor-zoom-in overflow-hidden rounded-lg"
        style={{ background: tint.bg, color: tint.fg }}
      >
        {kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={file.originalName} className="h-full w-full object-cover" />
        ) : kind === "video" ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video src={url} className="h-full w-full object-cover" muted />
        ) : (
          <span className="grid h-full w-full place-items-center font-mono text-[10px] font-semibold uppercase">
            {file.ext?.replace(".", "").slice(0, 4) || "file"}
          </span>
        )}
      </a>

      <button
        onClick={open}
        className="min-w-0 flex-1 text-left"
        title={previewable ? "Preview" : "Open"}
      >
        <p className="truncate font-mono text-[13px] text-zinc-100 group-hover:text-white">
          {file.originalName}
        </p>
        <p className="mt-0.5 truncate text-xs text-zinc-500 sm:hidden">
          {kind} · {formatBytes(file.size)} · {timeAgo(file.uploadedAt)}
          {expiry && <span className="text-amber-400/80"> · {expiry}</span>}
        </p>
      </button>

      <span
        className="hidden w-16 shrink-0 sm:block"
        style={{ color: tint.fg }}
      >
        <span className="rounded-md px-1.5 py-0.5 font-mono text-[11px]" style={{ background: tint.bg }}>
          {kind}
        </span>
      </span>
      <span className="hidden w-20 shrink-0 text-right text-xs text-zinc-400 sm:block">
        {formatBytes(file.size)}
      </span>
      <span className="hidden w-20 shrink-0 text-right text-xs text-zinc-400 sm:block">
        {timeAgo(file.uploadedAt)}
        {expiry && <span className="block text-[10px] text-amber-400/80">{expiry}</span>}
      </span>

      <div className="flex shrink-0 items-center gap-0.5 text-zinc-500 sm:w-[88px] sm:justify-end">
        <button
          onClick={copy}
          title={copied ? "Copied!" : "Copy link"}
          aria-label="Copy link"
          className="grid h-8 w-8 place-items-center rounded-lg transition-colors hover:bg-white/10 hover:text-white"
        >
          {copied ? (
            <span className="text-aura-300">{ICON.check}</span>
          ) : (
            ICON.copy
          )}
        </button>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          title="Open in new tab"
          aria-label="Open in new tab"
          className="grid h-8 w-8 place-items-center rounded-lg transition-colors hover:bg-white/10 hover:text-white"
        >
          {ICON.external}
        </a>
        <button
          onClick={() => onDelete(file)}
          title="Delete permanently"
          aria-label="Delete permanently"
          className="grid h-8 w-8 place-items-center rounded-lg transition-colors hover:bg-red-500/20 hover:text-red-300"
        >
          {ICON.trash}
        </button>
      </div>
    </div>
  );
}

const svg = "h-4 w-4";
const ICON = {
  copy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={svg} aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  external: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={svg} aria-hidden="true">
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={svg} aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={svg} aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
};
