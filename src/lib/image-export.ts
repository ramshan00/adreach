import { toPng } from "html-to-image";
import { publicAsset } from "./constants";

async function waitForImages(node: HTMLElement) {
  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    images.map((image) =>
      image.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            image.onload = () => resolve();
            image.onerror = () => resolve();
          }),
    ),
  );
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

function prepareExportClone(source: HTMLElement): { host: HTMLDivElement; clone: HTMLElement } {
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  Object.assign(host.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: "1080px",
    height: "1080px",
    overflow: "visible",
    transform: "none",
    pointerEvents: "none",
    zIndex: "-1",
  });

  const clone = source.cloneNode(true) as HTMLElement;
  clone.style.transform = "none";
  clone.style.width = "1080px";
  clone.style.height = "1080px";
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

export async function cardToFile(node: HTMLElement, filename: string) {
  const { host, clone } = prepareExportClone(node);

  try {
    await document.fonts.ready;
    await waitForImages(clone);

    const dataUrl = await toPng(clone, {
      width: 1080,
      height: 1080,
      canvasWidth: 1080,
      canvasHeight: 1080,
      pixelRatio: 1,
      cacheBust: true,
      backgroundColor: "#090914",
      style: {
        transform: "none",
        width: "1080px",
        height: "1080px",
        margin: "0",
        left: "0",
        top: "0",
      },
    });

    const blob = dataUrlToBlob(dataUrl);
    return new File([blob], filename, { type: "image/png" });
  } finally {
    host.remove();
  }
}
