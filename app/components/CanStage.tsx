"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "framer-motion";

import CanCanvas from "./CanCanvas";
import type { BrandConfig } from "../data/brands";
import { CAN_ASSET } from "../data/can";
import { SPRING, clamp } from "../lib/motion";

/** A lata acompanha o cursor no sentido oposto, e bem menos que os decorativos. */
const CAN_PARALLAX_X = -14;
const CAN_PARALLAX_Y = -9;

/** Quanto a lata escorrega junto com o dedo, em fração do deslocamento. */
const DRAG_FOLLOW = 0.16;

type CanStageProps = {
  brands: BrandConfig[];
  brand: BrandConfig;
  panel: MotionValue<number>;
  parallaxX: MotionValue<number>;
  parallaxY: MotionValue<number>;
  onGrab: () => void;
  onRelease: (origin: number, delta: number) => void;
  onTap: () => void;
};

export default function CanStage({
  brands,
  brand,
  panel,
  parallaxX,
  parallaxY,
  onGrab,
  onRelease,
  onTap,
}: CanStageProps) {
  const [ready, setReady] = useState(false);

  const canX = useTransform(parallaxX, (value) => value * CAN_PARALLAX_X);
  const canY = useTransform(parallaxY, (value) => value * CAN_PARALLAX_Y);

  const dragX = useMotionValue(0);
  const dragRotate = useTransform(dragX, (value) => value * 0.035);

  const travel = useRef(320);
  const drag = useRef({ active: false, startX: 0, startedAt: 0, origin: 0, moved: 0, delta: 0 });

  useEffect(() => {
    const measure = () => {
      travel.current = clamp(window.innerWidth * 0.42, 180, 460);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      onGrab();
      drag.current = {
        active: true,
        startX: event.clientX,
        startedAt: performance.now(),
        origin: panel.get(),
        moved: 0,
        delta: 0,
      };
    },
    [onGrab, panel],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const state = drag.current;
      if (!state.active) return;

      const distance = event.clientX - state.startX;
      state.delta = distance;
      state.moved = Math.max(state.moved, Math.abs(distance));

      // Arrastar para a esquerda avança; nunca mais de um painel por gesto.
      panel.set(state.origin + clamp(-distance / travel.current, -1, 1));
      dragX.set(clamp(distance, -travel.current, travel.current) * DRAG_FOLLOW);
    },
    [dragX, panel],
  );

  const endDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const state = drag.current;
      if (!state.active) return;
      state.active = false;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      animate(dragX, 0, SPRING);

      const isTap = state.moved < 6 && performance.now() - state.startedAt < 500;
      if (isTap) {
        onTap();
        return;
      }

      const threshold = travel.current * 0.26;
      const crossed = Math.abs(state.delta) > threshold;
      onRelease(state.origin, crossed ? (state.delta < 0 ? 1 : -1) : 0);
    },
    [dragX, onRelease, onTap],
  );

  return (
    // O padding inferior sobe a lata alguns vh: sem ele a base encosta na copy do rodapé.
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-[7vh]">
      <motion.div className="relative" style={{ x: canX, y: canY }}>
        {/* Sombra de contato: fica no chão e não acompanha o giro da lata. */}
        <div
          className="absolute bottom-0 left-1/2 h-[7%] w-[150%] -translate-x-1/2 translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(0,0,0,0.62),transparent)] blur-[6px]"
          aria-hidden="true"
        />

        <motion.div
          role="button"
          tabIndex={0}
          aria-label={`Lata ${brand.name}. Arraste, clique ou use as setas para trocar de marca.`}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onTap();
            }
          }}
          className="pointer-events-auto relative cursor-grab touch-none rounded-2xl outline-none select-none focus-visible:ring-2 focus-visible:ring-white/70 active:cursor-grabbing"
          style={{
            x: dragX,
            rotate: dragRotate,
            height: "min(64vh, 560px, 128vw)",
            aspectRatio: `${CAN_ASSET.aspect}`,
            filter: "drop-shadow(0 34px 48px rgba(0,0,0,0.45))",
          }}
          animate={{ opacity: ready ? 1 : 0, scale: ready ? 1 : 0.94 }}
          initial={{ opacity: 0, scale: 0.94 }}
          transition={SPRING}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <CanCanvas brands={brands} panel={panel} onReady={() => setReady(true)} />
        </motion.div>
      </motion.div>

      <span className="sr-only" aria-live="polite">
        {`Marca selecionada: ${brand.name}`}
      </span>
    </div>
  );
}
