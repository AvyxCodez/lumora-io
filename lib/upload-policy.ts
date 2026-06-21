import path from "path";

/** Max upload size, configurable via env (defaults to 200 MB). */
export const MAX_FILE_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB) || 200;
export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

/**
 * Almost everything is allowed. We only refuse a small set of executables and
 * Word documents. Note: active web content (.html/.svg/.js) is allowed to be
 * uploaded but is neutralised at serve time (see RENDER_UNSAFE_MIME below), so
 * it can never execute on our domain.
 */
const BLOCKED_EXTENSIONS = new Set([".exe", ".scr", ".cpl", ".jar"]);

/** Block any Word-document extension: .doc, .docx, .docm, .docb, … */
function isBlockedExt(ext: string): boolean {
  return BLOCKED_EXTENSIONS.has(ext) || ext.startsWith(".doc");
}

/** MIME types we refuse even if the extension looks innocent. */
const BLOCKED_MIME = new Set([
  // executables
  "application/x-msdownload",
  "application/x-msdos-program",
  "application/vnd.microsoft.portable-executable",
  // java archive
  "application/java-archive",
  // word documents
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-word.document.macroenabled.12",
]);

/**
 * Content types that must never be rendered inline by the browser (defense in
 * depth on the serving side). Served as text/plain + attachment instead.
 */
const RENDER_UNSAFE_MIME = new Set([
  "text/html",
  "application/xhtml+xml",
  "image/svg+xml",
  "text/javascript",
  "application/javascript",
  "application/x-javascript",
  "application/xml",
]);

export type Validation = { ok: true } | { ok: false; error: string; status: number };

export function validateUpload(file: {
  name: string;
  size: number;
  type: string;
}): Validation {
  if (file.size === 0) {
    return { ok: false, error: `"${file.name}" is empty.`, status: 400 };
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      ok: false,
      error: `"${file.name}" exceeds the ${MAX_FILE_SIZE_MB} MB limit.`,
      status: 413,
    };
  }

  const ext = path.extname(file.name).toLowerCase();
  if (isBlockedExt(ext)) {
    return {
      ok: false,
      error: `Files of type "${ext}" aren't allowed.`,
      status: 415,
    };
  }

  const mime = (file.type || "").toLowerCase().split(";")[0].trim();
  if (mime && BLOCKED_MIME.has(mime)) {
    return {
      ok: false,
      error: `Files of type "${mime}" aren't allowed.`,
      status: 415,
    };
  }

  return { ok: true };
}

/**
 * Returns the headers to use when serving a stored file, neutralising any type
 * that a browser might execute.
 */
export function safeServingType(type: string): { contentType: string; forceDownload: boolean } {
  const mime = (type || "").toLowerCase().split(";")[0].trim();
  if (RENDER_UNSAFE_MIME.has(mime)) {
    return { contentType: "text/plain; charset=utf-8", forceDownload: true };
  }
  return { contentType: type || "application/octet-stream", forceDownload: false };
}
