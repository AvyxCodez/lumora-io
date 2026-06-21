"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { formatBytes, kindFromType } from "@/lib/format";
import { addToHistory, deleteUpload } from "@/lib/history";
import { EXPIRY_PRESETS, expiresInLabel, type ExpiryKey } from "@/lib/expiry";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const MAX_MB = Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB) || 200;
const DIRECT_UPLOAD = process.env.NEXT_PUBLIC_DIRECT_UPLOAD === "true";

type UploadedFile = {
  id: string;
  name: string;
  originalName: string;
  ext: string;
  type: string;
  size: number;
  uploadedAt: number;
  expiresAt: number | null;
  deleteToken: string;
};

type Status = "idle" | "uploading" | "done" | "error";
type Mode = "keep" | "temp";

const TEMP_KEYS: ExpiryKey[] = ["1h", "12h", "24h", "72h"];

export function Uploader() {
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const [mode, setMode] = useState<Mode>("keep");
  const [expiry, setExpiry] = useState<ExpiryKey>("24h");
  const [urlInput, setUrlInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const upload = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (list.length === 0) return;

      setStatus("uploading");
      setError(null);
      setProgress(0);

      if (DIRECT_UPLOAD) {
        // Presigned upload: browser → R2 directly, one file at a time.
        const uploaded: UploadedFile[] = [];
        try {
          for (let i = 0; i < list.length; i++) {
            const file = list[i];
            const expires = mode === "temp" ? expiry : "never";

            // Step 1: get presigned URL + record from server.
            const presignRes = await fetch("/api/presign", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: file.name,
                type: file.type || "application/octet-stream",
                size: file.size,
                expires,
              }),
            });
            if (!presignRes.ok) {
              const { error } = await presignRes.json().catch(() => ({}));
              throw new Error(error || "Failed to get upload URL.");
            }
            const { presignedUrl, record, uploadHeaders } = await presignRes.json();

            // Step 2: PUT file bytes directly to R2 with progress tracking.
            await new Promise<void>((resolve, reject) => {
              const xhr = new XMLHttpRequest();
              xhr.open("PUT", presignedUrl);
              Object.entries(uploadHeaders as Record<string, string>).forEach(
                ([k, v]) => xhr.setRequestHeader(k, v)
              );
              xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                  const fileProgress = (i / list.length + e.loaded / e.total / list.length) * 100;
                  setProgress(Math.round(fileProgress));
                }
              };
              xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) resolve();
                else reject(new Error(`R2 upload failed (${xhr.status})`));
              };
              xhr.onerror = () => reject(new Error("Network error."));
              xhr.send(file);
            });

            uploaded.push(record);
          }

          setResults((prev) => [...uploaded, ...prev]);
          addToHistory(uploaded);
          setStatus("done");
          setProgress(100);
        } catch (e: unknown) {
          setError(e instanceof Error ? e.message : "Upload failed.");
          setStatus("error");
        }
        return;
      }

      // Local driver: POST the whole file to our API.
      const form = new FormData();
      list.forEach((f) => form.append("file", f));
      form.append("expires", mode === "temp" ? expiry : "never");

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload");

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      };

      xhr.onload = () => {
        try {
          const res = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            setResults((prev) => [...res.files, ...prev]);
            addToHistory(res.files);
            setStatus("done");
            setProgress(100);
          } else {
            setError(res.error || "Upload failed.");
            setStatus("error");
          }
        } catch {
          setError("Unexpected server response.");
          setStatus("error");
        }
      };

      xhr.onerror = () => {
        setError("Network error. Please try again.");
        setStatus("error");
      };

      xhr.send(form);
    },
    [mode, expiry]
  );

  const uploadFromUrl = async () => {
    const url = urlInput.trim();
    if (!url) return;
    setStatus("uploading");
    setError(null);
    setProgress(0);
    try {
      const res = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, expires: mode === "temp" ? expiry : "never" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      setResults((prev) => [data.file, ...prev]);
      addToHistory([data.file]);
      setStatus("done");
      setProgress(100);
      setUrlInput("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed.");
      setStatus("error");
    }
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files?.length) upload(e.dataTransfer.files);
    },
    [upload]
  );

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = e.clipboardData?.files;
      if (files && files.length) upload(files);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [upload]);

  return (
    <div className="w-full">
      {/* Keep / Temporary tabs */}
      <div className="mb-4 flex items-center gap-1 rounded-2xl bg-ink-800/70 p-1 text-sm ring-1 ring-white/5">
        <button
          onClick={() => setMode("keep")}
          className={`flex-1 rounded-xl px-3 py-2 font-medium transition-colors ${
            mode === "keep" ? "bg-aura-500/20 text-white ring-1 ring-aura-500/40" : "text-zinc-400 hover:text-white"
          }`}
        >
          ♾️ Keep forever
        </button>
        <button
          onClick={() => setMode("temp")}
          className={`flex-1 rounded-xl px-3 py-2 font-medium transition-colors ${
            mode === "temp" ? "bg-aura-500/20 text-white ring-1 ring-aura-500/40" : "text-zinc-400 hover:text-white"
          }`}
        >
          ⏳ Temporary
        </button>
      </div>

      {mode === "temp" && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500">Self-destructs after:</span>
          {TEMP_KEYS.map((k) => (
            <button
              key={k}
              onClick={() => setExpiry(k)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                expiry === k
                  ? "bg-aura-500 text-white"
                  : "bg-white/5 text-zinc-300 hover:bg-white/10"
              }`}
            >
              {EXPIRY_PRESETS[k].label}
            </button>
          ))}
        </div>
      )}

      {/* Dropzone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`group relative cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed p-10 text-center transition-all duration-300 sm:p-12 ${
          dragging
            ? "border-aura-400 bg-aura-500/10 shadow-glow"
            : "border-white/10 bg-ink-800/40 hover:border-aura-500/50 hover:bg-ink-800/70"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => e.target.files && upload(e.target.files)}
        />

        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-aura-500/30 to-aura-700/20 text-aura-200 ring-1 ring-aura-500/30 animate-float">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 16V4m0 0l-4 4m4-4l4 4" />
            <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
          </svg>
        </div>

        <p className="text-base font-medium text-white">
          {dragging ? "drop it like it's hot 🔥" : "drop files here"}
        </p>
        <p className="mt-1 text-sm text-zinc-400">
          or <span className="text-aura-300 underline-offset-2 group-hover:underline">pick some</span>{" "}
          · paste a screenshot · {MAX_MB}&nbsp;MB max
        </p>
      </div>

      {/* URL import */}
      <div className="mt-3 flex items-center gap-2">
        <input
          ref={urlRef}
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && uploadFromUrl()}
          placeholder="or paste a URL to import…"
          disabled={status === "uploading"}
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-ink-800/60 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-aura-500/50 focus:ring-1 focus:ring-aura-500/30 disabled:opacity-50"
        />
        <button
          onClick={uploadFromUrl}
          disabled={!urlInput.trim() || status === "uploading"}
          className="shrink-0 rounded-xl bg-aura-500/20 px-4 py-2.5 text-sm font-medium text-aura-300 ring-1 ring-aura-500/40 transition-colors hover:bg-aura-500/30 disabled:opacity-40"
        >
          import
        </button>
      </div>

      {status === "uploading" && (
        <div className="mt-5">
          <div className="mb-2 flex justify-between text-xs text-zinc-400">
            <span>beaming it up…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-ink-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-aura-400 to-aura-600 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-7 space-y-3">
          <h3 className="text-sm font-medium text-zinc-400">
            here you go ({results.length})
          </h3>
          {results.map((f) => (
            <ResultRow
              key={f.id}
              file={f}
              origin={origin}
              onDeleted={() => setResults((prev) => prev.filter((r) => r.id !== f.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ResultRow({
  file,
  origin,
  onDeleted,
}: {
  file: UploadedFile;
  origin: string;
  onDeleted: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const url = `${origin}/f/${file.name}`;
  const kind = kindFromType(file.type);
  const expLabel = expiresInLabel(file.expiresAt);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const remove = async () => {
    setConfirmOpen(false);
    setDeleting(true);
    const ok = await deleteUpload(file);
    if (ok) onDeleted();
    else setDeleting(false);
  };

  return (
    <div className="glass glass-hover flex items-center gap-3 rounded-2xl p-3">
      <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-ink-700">
        {kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={file.originalName} className="h-full w-full object-cover" />
        ) : (
          <KindIcon kind={kind} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-white">{file.originalName}</p>
          {expLabel && (
            <span className="shrink-0 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-300">
              {expLabel}
            </span>
          )}
        </div>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="block truncate text-xs text-aura-300 hover:underline"
        >
          {url}
        </a>
      </div>

      <button
        onClick={copy}
        className="shrink-0 rounded-xl bg-white/5 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-aura-500/20"
      >
        {copied ? "copied!" : "copy"}
      </button>
      <button
        onClick={() => setConfirmOpen(true)}
        disabled={deleting}
        title="Delete permanently"
        className="shrink-0 rounded-xl bg-white/5 px-2.5 py-2 text-xs text-zinc-400 transition-colors hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50"
      >
        {deleting ? "…" : "🗑"}
      </button>
      <ConfirmDialog
        open={confirmOpen}
        title="Delete file?"
        message={`"${file.originalName}" will be permanently deleted and the link will stop working.`}
        confirmLabel="Delete"
        onConfirm={remove}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

function KindIcon({ kind }: { kind: "video" | "audio" | "file" }) {
  const common = "h-5 w-5 text-aura-300";
  if (kind === "video")
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M10 9l5 3-5 3V9z" fill="currentColor" />
      </svg>
    );
  if (kind === "audio")
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18V5l10-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="16" cy="16" r="3" />
      </svg>
    );
  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}
