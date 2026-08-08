import { useEffect, useRef } from "react";
import { finePointerQuery } from "../config/media-queries";
import type { ParticlePointerState } from "../three/particle-pointer";

export function useParticlePointer() {
  const pointerRef = useRef<ParticlePointerState>({ x: 0, y: 0, active: false });

  useEffect(() => {
    const finePointer = window.matchMedia(finePointerQuery);
    const handlePointerMove = (event: PointerEvent) => {
      if (!finePointer.matches) return;
      pointerRef.current.x = event.clientX / window.innerWidth * 2 - 1;
      pointerRef.current.y = -(event.clientY / window.innerHeight * 2 - 1);
      pointerRef.current.active = true;
    };
    const handlePointerLeave = () => {
      pointerRef.current.active = false;
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return pointerRef;
}
