import { toPng } from "html-to-image";

async function waitForImages(node: HTMLElement) {
  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(images.map((image) => image.complete ? Promise.resolve() : new Promise<void>((resolve) => { image.onload = () => resolve(); image.onerror = () => resolve(); })));
}

export async function cardToFile(node: HTMLElement, filename: string) {
  await document.fonts.ready;
  await waitForImages(node);
  const dataUrl = await toPng(node, { width: 1080, height: 1080, pixelRatio: 1, cacheBust: true, backgroundColor: "#050812", style: { transform: "none", width: "1080px", height: "1080px" } });
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], filename, { type: "image/png" });
}
