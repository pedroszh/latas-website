"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animate, useMotionValue, type AnimationPlaybackControls } from "framer-motion";

import { SPRING, wrap } from "../lib/motion";

/**
 * Estado central da navegação entre marcas.
 *
 * `panel` é uma posição contínua em painéis que o drag manipula diretamente —
 * é ela que alimenta o rótulo, o fundo e o título. `index` é o índice discreto
 * da marca, sempre normalizado para o intervalo válido pelo módulo.
 */
export function useBrandCarousel(count: number) {
  const panel = useMotionValue(0);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const playback = useRef<AnimationPlaybackControls | null>(null);

  useEffect(
    () =>
      panel.on("change", (value) => {
        const next = wrap(Math.round(value), count);
        setIndex((previous) => (previous === next ? previous : next));
      }),
    [panel, count],
  );

  useEffect(() => () => playback.current?.stop(), []);

  const animateTo = useCallback(
    (target: number) => {
      playback.current?.stop();
      playback.current = animate(panel, target, SPRING);
    },
    [panel],
  );

  /** Interrompe a animação em curso — usado ao começar um drag. */
  const halt = useCallback(() => {
    playback.current?.stop();
    playback.current = null;
  }, []);

  /** Avança (`delta > 0`) ou volta (`delta < 0`) exatamente um painel por vez. */
  const goTo = useCallback(
    (delta: number) => {
      const from = Math.round(panel.get());
      if (delta === 0) {
        animateTo(from);
        return;
      }
      setDirection(delta > 0 ? 1 : -1);
      animateTo(from + Math.sign(delta));
    },
    [animateTo, panel],
  );

  /** Acomoda o carrossel depois de um drag, a partir do painel de origem. */
  const settle = useCallback(
    (origin: number, delta: number) => {
      if (delta !== 0) setDirection(delta > 0 ? 1 : -1);
      animateTo(Math.round(origin) + Math.sign(delta));
    },
    [animateTo],
  );

  return { panel, index, direction, goTo, settle, halt };
}
