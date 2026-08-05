"use client";
import { type RefObject, useEffect, useRef, useState } from "react";
import { EventCard } from "@/components/event-card/EventCard";

export function EventCardPreview({ cardRef, ...props }: { cardRef: RefObject<HTMLDivElement | null>; fullName: string; designation?: string; photo?: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const updateScale = () => setScale(stage.clientWidth / 1080);
    const observer = new ResizeObserver(updateScale);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  return <div ref={stageRef} className="preview-stage" aria-label="Live personalized card preview"><div className="preview-scaler" style={{ transform: `scale(${scale})` }}><EventCard ref={cardRef} {...props} /></div></div>;
}
