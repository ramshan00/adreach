"use client";

import { useState, type RefObject } from "react";
import { Download, LoaderCircle } from "lucide-react";
import { cardToFile } from "@/lib/image-export";
import { sanitizeFilename } from "@/lib/utils";

function isIOSDevice() {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function canShareFiles(file: File): boolean {
  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean;
  };
  if (typeof nav.share !== "function" || typeof nav.canShare !== "function") {
    return false;
  }
  try {
    return nav.canShare({ files: [file] });
  } catch {
    return false;
  }
}

async function saveFile(file: File, filename: string) {
  if (canShareFiles(file)) {
    try {
      await navigator.share({ files: [file], title: filename });
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      // Fall through to download / open if share fails for other reasons.
    }
  }

  const url = URL.createObjectURL(file);
  const revokeMs = isIOSDevice() ? 60_000 : 2_000;

  try {
    // iOS Safari ignores <a download> for blob URLs — open the image instead.
    if (isIOSDevice()) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), revokeMs);
  }
}

export function DownloadCardButton({
  cardRef,
  fullName,
  enabled,
}: {
  cardRef: RefObject<HTMLDivElement | null>;
  fullName: string;
  enabled: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const filename = `adreach-tiktok-seminar-2026-${sanitizeFilename(fullName)}.png`;

  async function makeFile() {
    const card = cardRef.current;
    if (!card) throw new Error("The image preview is not ready.");
    return cardToFile(card, filename);
  }

  async function download() {
    if (busy || !enabled) return;
    setBusy(true);
    setError("");
    try {
      const file = await makeFile();
      await saveFile(file, filename);
    } catch {
      setError("We could not create the image. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="export-actions" aria-live="polite">
      <button
        type="button"
        className="button button-primary"
        disabled={!enabled || busy}
        onClick={download}
      >
        {busy ? <LoaderCircle className="spin" /> : <Download />}
        {busy ? "Preparing image…" : "Download Image"}
      </button>
      {!enabled && <p>Register successfully to unlock download.</p>}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
    </div>
  );
}
