"use client";
import { type RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { EventCard } from "@/components/event-card/EventCard";

export function EventCardPreview({ cardRef, ...props }: { cardRef: RefObject<HTMLDivElement | null>; fullName: string; designation?: string; photo?: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.3);

  const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const updateScale = () => {
      const width = stage.clientWidth;
      if (width > 0) {
        setScale(width / 1080);
      }
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(stage);

    window.addEventListener("resize", updateScale);
    window.addEventListener("orientationchange", updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
      window.removeEventListener("orientationchange", updateScale);
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className="preview-stage"
      style={{
        width: "100%",
        aspectRatio: "1 / 1",
        position: "relative",
        overflow: "hidden",
      }}
      aria-label="Live personalized card preview"
    >
      <div
        className="preview-scaler"
        style={{
          width: "1080px",
          height: "1080px",
          transform: scale > 0 ? `scale(${scale})` : "none",
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <EventCard ref={cardRef} {...props} />
      </div>
    </div>
  );
}

