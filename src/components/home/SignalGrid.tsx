import { useEffect, useRef } from "react";
import { experienceConfig } from "../../config/experience";

type SignalGridProps = { className?: string };

export function SignalGrid({ className = "" }: SignalGridProps) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const enabled = experienceConfig.signalGrid.enabled;

  useEffect(() => {
    const grid = gridRef.current;
    if (!enabled || !grid) return;

    const finePointer = window.matchMedia("(pointer: fine)");
    let frame = 0;
    let nextX = 50;
    let nextY = 50;
    let visible = false;

    const paint = () => {
      frame = 0;
      grid.style.setProperty("--grid-x", `${nextX}%`);
      grid.style.setProperty("--grid-y", `${nextY}%`);
    };
    const move = (event: PointerEvent) => {
      if (!visible || !finePointer.matches) return;
      const rect = grid.getBoundingClientRect();
      nextX = ((event.clientX - rect.left) / rect.width) * 100;
      nextY = ((event.clientY - rect.top) / rect.height) * 100;
      if (!frame) frame = window.requestAnimationFrame(paint);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      grid.dataset.active = String(visible && finePointer.matches);
    });

    observer.observe(grid);
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", move);
    };
  }, [enabled]);

  if (!enabled) return null;

  return <div ref={gridRef} className={`signal-grid ${className}`} aria-hidden="true" />;
}
