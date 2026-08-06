"use client";

import { useEffect, useState, type RefObject } from "react";
import { Download, LoaderCircle } from "lucide-react";
import { cardToFile } from "@/lib/image-export";
import { sanitizeFilename } from "@/lib/utils";

export function DownloadCardButton({ cardRef, fullName, enabled }: { cardRef: RefObject<HTMLDivElement | null>; fullName: string; enabled: boolean }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const filename = `adreach-tiktok-seminar-2026-${sanitizeFilename(fullName)}.png`;
  async function makeFile() { const card = cardRef.current; if (!card) throw new Error("The image preview is not ready."); return cardToFile(card, filename); }
  async function download() { if (busy || !enabled) return; setBusy(true); setError(""); try { const file = await makeFile(); const url = URL.createObjectURL(file); const link = document.createElement("a"); link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); } catch { setError("We could not create the image. Please try again."); } finally { setBusy(false); } }
  return <div className="export-actions" aria-live="polite"><button type="button" className="button button-primary" disabled={!enabled || busy} onClick={download}>{busy ? <LoaderCircle className="spin" /> : <Download />} {busy ? "Preparing image…" : "Download Image"}</button>{!enabled && <p>Register successfully to unlock download.</p>}{error && <p role="alert" className="form-error">{error}</p>}</div>;
}
