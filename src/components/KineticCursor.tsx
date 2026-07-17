import { useEffect, useRef } from "react";

const INTERACTIVE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "summary",
  "[role='button']",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

type CursorPoint = {
  x: number;
  y: number;
};

type CursorSize = {
  width: number;
  height: number;
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function KineticCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);
  const outerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const inner = innerRef.current;
    const outer = outerRef.current;
    const finePointer = window.matchMedia("(min-width: 48rem) and (hover: hover) and (pointer: fine)");
    if (!root || !inner || !outer || !finePointer.matches) return;

    const target: CursorPoint = { x: 0, y: 0 };
    const tight: CursorPoint = { x: 0, y: 0 };
    const loose: CursorPoint = { x: 0, y: 0 };
    const targetSize: CursorSize = { width: 44, height: 44 };
    const size: CursorSize = { width: 44, height: 44 };
    let initialised = false;
    let frame = 0;
    let visible = false;

    const render = () => {
      frame = 0;
      tight.x += (target.x - tight.x) * 0.38;
      tight.y += (target.y - tight.y) * 0.38;
      loose.x += (target.x - loose.x) * 0.115;
      loose.y += (target.y - loose.y) * 0.115;
      size.width += (targetSize.width - size.width) * 0.16;
      size.height += (targetSize.height - size.height) * 0.16;

      inner.style.transform = `translate3d(${tight.x}px, ${tight.y}px, 0) translate(-50%, -50%)`;
      outer.style.width = `${size.width}px`;
      outer.style.height = `${size.height}px`;
      outer.style.transform = `translate3d(${loose.x}px, ${loose.y}px, 0) translate(-50%, -50%)`;

      const moving = Math.abs(target.x - tight.x) > 0.05
        || Math.abs(target.y - tight.y) > 0.05
        || Math.abs(target.x - loose.x) > 0.05
        || Math.abs(target.y - loose.y) > 0.05
        || Math.abs(targetSize.width - size.width) > 0.05
        || Math.abs(targetSize.height - size.height) > 0.05;
      if (visible && moving) frame = window.requestAnimationFrame(render);
    };

    const schedule = () => {
      if (!frame && document.visibilityState === "visible") {
        frame = window.requestAnimationFrame(render);
      }
    };

    const updateInteractiveState = (eventTarget: EventTarget | null) => {
      const element = eventTarget instanceof Element
        ? eventTarget.closest<HTMLElement>(INTERACTIVE_SELECTOR)
        : null;
      const disabled = element?.getAttribute("aria-disabled") === "true";
      const interactive = Boolean(element && !disabled);
      root.dataset.interactive = interactive ? "true" : "false";

      if (!interactive || !element) {
        targetSize.width = 44;
        targetSize.height = 44;
        return;
      }

      const bounds = element.getBoundingClientRect();
      targetSize.width = clamp(bounds.width + 14, 52, 180);
      targetSize.height = clamp(bounds.height + 14, 42, 76);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!finePointer.matches || event.pointerType === "touch") return;
      target.x = event.clientX;
      target.y = event.clientY;
      if (!initialised) {
        tight.x = target.x;
        tight.y = target.y;
        loose.x = target.x;
        loose.y = target.y;
        initialised = true;
      }
      visible = true;
      root.dataset.visible = "true";
      updateInteractiveState(event.target);
      schedule();
    };

    const handlePointerDown = () => {
      root.dataset.pressed = "true";
    };
    const handlePointerUp = () => {
      root.dataset.pressed = "false";
    };
    const handlePointerLeave = () => {
      visible = false;
      root.dataset.visible = "false";
      root.dataset.interactive = "false";
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") handlePointerLeave();
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", handlePointerLeave);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      document.documentElement.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div ref={rootRef} className="kinetic-cursor" data-visible="false" data-interactive="false" data-pressed="false" aria-hidden="true">
      <span ref={outerRef} className="kinetic-cursor__outer" />
      <span ref={innerRef} className="kinetic-cursor__inner" />
    </div>
  );
}
