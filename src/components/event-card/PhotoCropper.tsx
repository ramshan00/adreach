"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { RotateCcw } from "lucide-react";

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    // decode() is unsupported/unreliable on some iOS Safari versions and
    // Android in-app webviews (Instagram/Facebook browser), so we rely
    // on the load event instead — this works everywhere.
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The image could not be loaded."));
    image.src = source;
  });
}

export async function createCroppedImage(source: string, crop: Area): Promise<string> {
  const image = await loadImage(source);
  const canvas = document.createElement("canvas");
  canvas.width = 700;
  canvas.height = 700;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Image processing is unavailable.");
  context.fillStyle = "#061c46";
  context.fillRect(0, 0, 700, 700);
  context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, 700, 700);
  return canvas.toDataURL("image/jpeg", 0.94);
}

export function PhotoCropper({
  source,
  onChange,
  onCancel,
}: {
  source: string;
  onChange: (area: Area) => void;
  onCancel: () => void;
}) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropPixels, setCropPixels] = useState<Area | null>(null);

  const complete = useCallback(
    (_: Area, pixels: Area) => {
      setCropPixels(pixels);
      onChange(pixels);
    },
    [onChange]
  );

  const reset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <div className="crop-shell">
      <div className="crop-area">
        <Cropper
          image={source}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={complete}
        />
      </div>
      <div className="crop-controls">
        <label htmlFor="photo-zoom">Zoom</label>
        <input
          id="photo-zoom"
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
        />
        <button type="button" onClick={reset}>
          <RotateCcw size={16} /> Reset
        </button>
        <button type="button" disabled={!cropPixels} onClick={() => cropPixels && onChange(cropPixels)}>
          Use crop
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}