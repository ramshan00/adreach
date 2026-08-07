import { toCanvas } from "html-to-image";
import { publicAsset } from "./constants";

const CARD_SIZE = 1080;

function waitForLoadOrError(image: HTMLImageElement): Promise<void> {
  return new Promise((resolve) => {
    const done = () => {
      image.removeEventListener("load", done);
      image.removeEventListener("error", done);
      resolve();
    };
    image.addEventListener("load", done);
    image.addEventListener("error", done);
  });
}

/** Wait until each <img> is decoded/paint-ready. Do not trust img.complete alone (iOS Safari clones). */
async function ensureImageDecoded(image: HTMLImageElement): Promise<void> {
  if (typeof image.decode === "function") {
    try {
      await image.decode();
      return;
    } catch {
      // Still loading or not paint-ready yet — fall through.
    }
  }

  if (!image.complete) {
    await waitForLoadOrError(image);
  }

  if (typeof image.decode === "function") {
    try {
      await image.decode();
    } catch {
      // Broken image: do not hang export.
    }
  }
}

async function waitForImages(node: HTMLElement) {
  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(images.map((image) => ensureImageDecoded(image)));
}

/** Convert a data URL to a Blob without fetch (more reliable on iOS Safari). */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data = ""] = dataUrl.split(",", 2);
  const isBase64 = /;base64/i.test(header ?? "");
  const mime = header?.match(/data:([^;]+)/)?.[1] ?? "image/png";
  const binary = isBase64 ? atob(data) : decodeURIComponent(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

function absolutePublicUrl(path: string): string {
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).href;
}

function resolveCardBackground(source: HTMLElement): string {
  const computed = getComputedStyle(source).backgroundImage;
  if (computed && computed !== "none") {
    const match = computed.match(/url\((['"]?)(.*?)\1\)/);
    if (match?.[2]) {
      const raw = match[2];
      if (raw.startsWith("data:") || raw.startsWith("blob:") || /^https?:/i.test(raw)) {
        return raw;
      }
      return absolutePublicUrl(raw);
    }
  }
  return absolutePublicUrl(publicAsset("/bg.jpeg"));
}

function isExportDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("exportDebug") === "1";
}

function imgDebugInfo(label: string, image: HTMLImageElement | null) {
  if (!image) {
    return { label, present: false };
  }
  const src = image.currentSrc || image.src || "";
  return {
    label,
    present: true,
    isDataUrl: src.startsWith("data:"),
    srcPrefix: src.slice(0, 32),
    srcLength: src.length,
    complete: image.complete,
    naturalWidth: image.naturalWidth,
    naturalHeight: image.naturalHeight,
  };
}

function findPortraitImage(card: HTMLElement): HTMLImageElement | null {
  return card.querySelector<HTMLImageElement>(".portrait-frame img");
}

type PortraitBox = { x: number; y: number; width: number; height: number };

/** Matches .reference-card layout when getBoundingClientRect is unreliable (offscreen / iOS Chrome). */
const FALLBACK_PORTRAIT_BOX: PortraitBox = {
  x: 110,
  y: 442,
  width: 330,
  height: 352,
};

function getPortraitBox(card: HTMLElement, target: Element): PortraitBox {
  const cardRect = card.getBoundingClientRect();
  const photoRect = target.getBoundingClientRect();
  const scaleX = CARD_SIZE / Math.max(cardRect.width, 1);
  const scaleY = CARD_SIZE / Math.max(cardRect.height, 1);
  return {
    x: (photoRect.left - cardRect.left) * scaleX,
    y: (photoRect.top - cardRect.top) * scaleY,
    width: photoRect.width * scaleX,
    height: photoRect.height * scaleY,
  };
}

function isUsableBox(box: PortraitBox): boolean {
  return box.width > 1 && box.height > 1 && Number.isFinite(box.x) && Number.isFinite(box.y);
}

/** Prefer visible live card geometry; fall back to clone, then CSS constants. */
function resolvePortraitBox(
  liveCard: HTMLElement,
  cloneCard: HTMLElement,
  livePortrait: HTMLImageElement | null,
  clonePortrait: HTMLImageElement | null,
): PortraitBox {
  const liveFrame = liveCard.querySelector(".portrait-frame");
  if (liveFrame) {
    const box = getPortraitBox(liveCard, liveFrame);
    if (isUsableBox(box)) return box;
  }
  if (livePortrait) {
    const box = getPortraitBox(liveCard, livePortrait);
    if (isUsableBox(box)) return box;
  }

  const cloneFrame = cloneCard.querySelector(".portrait-frame");
  if (cloneFrame) {
    const box = getPortraitBox(cloneCard, cloneFrame);
    if (isUsableBox(box)) return box;
  }
  if (clonePortrait) {
    const box = getPortraitBox(cloneCard, clonePortrait);
    if (isUsableBox(box)) return box;
  }

  return FALLBACK_PORTRAIT_BOX;
}

async function loadPortraitBitmap(src: string): Promise<HTMLImageElement | null> {
  if (!src) return null;
  const image = new Image();
  image.src = src;
  await ensureImageDecoded(image);
  if (image.naturalWidth <= 0 || image.naturalHeight <= 0) return null;
  return image;
}

/** CSS object-fit: cover source crop for drawImage. */
function objectFitCoverSource(
  image: HTMLImageElement,
  destWidth: number,
  destHeight: number,
): { sx: number; sy: number; sw: number; sh: number } {
  const iw = image.naturalWidth || image.width;
  const ih = image.naturalHeight || image.height;
  if (!iw || !ih || !destWidth || !destHeight) {
    return { sx: 0, sy: 0, sw: iw || 1, sh: ih || 1 };
  }
  const scale = Math.max(destWidth / iw, destHeight / ih);
  const sw = destWidth / scale;
  const sh = destHeight / scale;
  const sx = (iw - sw) / 2;
  const sy = (ih - sh) / 2;
  return { sx, sy, sw, sh };
}

function drawPortraitCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  box: PortraitBox,
) {
  const { sx, sy, sw, sh } = objectFitCoverSource(image, box.width, box.height);
  ctx.save();
  ctx.beginPath();
  // Match rounded portrait frame roughly; clip to box (border-radius is visual; overflow hidden on frame).
  const radius = Math.min(44, box.width / 2, box.height / 2);
  const { x, y, width, height } = box;
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(image, sx, sy, sw, sh, x, y, width, height);
  ctx.restore();
}

async function samplePortraitPresence(
  pngDataUrl: string,
  box: PortraitBox,
): Promise<{ portraitLikelyPresent: boolean; differingSamples: number; samples: number }> {
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Failed to load export PNG for debug sampling."));
    image.src = pngDataUrl;
  });
  if (typeof image.decode === "function") {
    try {
      await image.decode();
    } catch {
      // continue with loaded bitmap
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = CARD_SIZE;
  canvas.height = CARD_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { portraitLikelyPresent: false, differingSamples: 0, samples: 0 };

  ctx.drawImage(image, 0, 0);
  const inset = 8;
  const x0 = Math.max(0, Math.floor(box.x + inset));
  const y0 = Math.max(0, Math.floor(box.y + inset));
  const x1 = Math.min(CARD_SIZE - 1, Math.floor(box.x + box.width - inset));
  const y1 = Math.min(CARD_SIZE - 1, Math.floor(box.y + box.height - inset));
  const points = [
    [x0, y0],
    [x1, y0],
    [x0, y1],
    [x1, y1],
    [Math.floor((x0 + x1) / 2), Math.floor((y0 + y1) / 2)],
  ] as const;

  // Empty/placeholder slot is typically dark navy; photo pixels usually deviate.
  let differing = 0;
  for (const [px, py] of points) {
    const [r = 0, g = 0, b = 0] = ctx.getImageData(px, py, 1, 1).data;
    const isNearNavy = r < 50 && g < 55 && b < 90;
    const isNearBlack = r + g + b < 40;
    if (!isNearNavy && !isNearBlack) differing += 1;
  }

  return {
    portraitLikelyPresent: differing >= 2,
    differingSamples: differing,
    samples: points.length,
  };
}

function prepareExportClone(source: HTMLElement): { host: HTMLDivElement; clone: HTMLElement } {
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  Object.assign(host.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: `${CARD_SIZE}px`,
    height: `${CARD_SIZE}px`,
    overflow: "hidden",
    opacity: "0",
    transform: "none",
    pointerEvents: "none",
    zIndex: "-1",
  });

  const clone = source.cloneNode(true) as HTMLElement;
  clone.style.transform = "none";
  clone.style.width = `${CARD_SIZE}px`;
  clone.style.height = `${CARD_SIZE}px`;
  clone.style.margin = "0";
  clone.style.left = "0";
  clone.style.top = "0";
  clone.style.position = "relative";
  clone.style.backgroundImage = `url("${resolveCardBackground(source)}")`;
  clone.style.backgroundSize = "cover";
  clone.style.backgroundPosition = "center";
  clone.style.backgroundRepeat = "no-repeat";

  host.appendChild(clone);
  document.body.appendChild(host);
  return { host, clone };
}

const captureOptions = {
  width: CARD_SIZE,
  height: CARD_SIZE,
  canvasWidth: CARD_SIZE,
  canvasHeight: CARD_SIZE,
  pixelRatio: 1,
  cacheBust: true,
  backgroundColor: "#090914",
  style: {
    transform: "none",
    width: `${CARD_SIZE}px`,
    height: `${CARD_SIZE}px`,
    margin: "0",
    left: "0",
    top: "0",
  },
} as const;

export async function cardToFile(node: HTMLElement, filename: string) {
  const debug = isExportDebugEnabled();
  const { host, clone } = prepareExportClone(node);
  const livePortrait = findPortraitImage(node);
  const clonePortrait = findPortraitImage(clone);

  try {
    await document.fonts.ready;
    await waitForImages(clone);
    if (livePortrait) await ensureImageDecoded(livePortrait);

    const photoSrc =
      (livePortrait?.currentSrc || livePortrait?.src || "").trim() ||
      (clonePortrait?.currentSrc || clonePortrait?.src || "").trim();

    const portraitBox = photoSrc
      ? resolvePortraitBox(node, clone, livePortrait, clonePortrait)
      : null;

    const portraitSource = photoSrc ? await loadPortraitBitmap(photoSrc) : null;

    if (debug) {
      console.info("[exportDebug] live portrait", imgDebugInfo("live", livePortrait));
      console.info("[exportDebug] clone portrait before capture", imgDebugInfo("clone", clonePortrait));
      console.info("[exportDebug] composite plan", {
        hasPhotoSrc: Boolean(photoSrc),
        srcIsDataUrl: photoSrc.startsWith("data:"),
        portraitLoaded: Boolean(portraitSource),
        portraitBox,
      });
    }

    // Hide clone img so foreignObject cannot paint a blank/broken portrait; we draw after capture.
    if (clonePortrait && portraitSource) {
      clonePortrait.style.visibility = "hidden";
    }

    const canvas = await toCanvas(clone, captureOptions);

    let composited = false;
    if (portraitSource && portraitBox && isUsableBox(portraitBox)) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        drawPortraitCover(ctx, portraitSource, portraitBox);
        composited = true;
      }
    }

    const dataUrl = canvas.toDataURL("image/png");

    if (debug && portraitBox) {
      const sample = await samplePortraitPresence(dataUrl, portraitBox);
      console.info("[exportDebug] png portrait sample", {
        ...sample,
        portraitBox,
        composited,
      });
    }

    const blob = dataUrlToBlob(dataUrl);
    return new File([blob], filename, { type: "image/png" });
  } finally {
    host.remove();
  }
}
