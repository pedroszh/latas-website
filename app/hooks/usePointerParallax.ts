"use client";

import { useEffect } from "react";
import { useMotionValue, useSpring } from "framer-motion";

const SOFT = { stiffness: 55, damping: 20, mass: 0.8 } as const;

/**
 * Posição do cursor normalizada em [-1, 1] nos dois eixos, amortecida por
 * springs.
 *
 * Escreve apenas em motion values: nenhum movimento do mouse causa re-render.
 */
export function usePointerParallax() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, SOFT);
  const springY = useSpring(y, SOFT);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const handleMove = (event: PointerEvent) => {
      x.set((event.clientX / window.innerWidth) * 2 - 1);
      y.set((event.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => window.removeEventListener("pointermove", handleMove);
  }, [x, y]);

  return { x: springX, y: springY };
}
