"use client";

import { type RefObject, useLayoutEffect, useRef, useState } from "react";
import { EventCard } from "@/components/event-card/EventCard";

export function EventCardPreview({
  cardRef,
  ...props
}: {
  cardRef: RefObject<HTMLDivElement | null>;
  fullName: string;
  designation?: string;
  photo?: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.3);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let orientationTimer: ReturnType<typeof setTimeout> | undefined;
    let raf1 = 0;
    let raf2 = 0;

    const updateScale = () => {
      const width = stage.clientWidth;
      if (width > 0) {
        setScale(Math.max(width / 1080, 0.01));
      }
    };

    const updateAfterLayout = () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(updateScale);
      });
    };

    const updateAfterOrientation = () => {
      updateAfterLayout();
      clearTimeout(orientationTimer);
      // iOS Safari reports stale widths until after rotate / toolbar settle.
      orientationTimer = setTimeout(updateAfterLayout, 250);
    };

    updateAfterLayout();

    const observer = new ResizeObserver(updateAfterLayout);
    observer.observe(stage);

    window.addEventListener("resize", updateAfterLayout);
    window.addEventListener("orientationchange", updateAfterOrientation);
    window.visualViewport?.addEventListener("resize", updateAfterLayout);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(orientationTimer);
      window.removeEventListener("resize", updateAfterLayout);
      window.removeEventListener("orientationchange", updateAfterOrientation);
      window.visualViewport?.removeEventListener("resize", updateAfterLayout);
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
