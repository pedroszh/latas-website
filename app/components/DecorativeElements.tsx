"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, type MotionValue, type Variants } from "framer-motion";

import type { BrandConfig, DecorativeElement } from "../data/brands";
import { SPRING } from "../lib/motion";

/** Amplitude do parallax dos elementos decorativos, em px (antes da profundidade). */
const PARALLAX_X = 26;
const PARALLAX_Y = 18;

/** Viewport de referência para as larguras declaradas em brands.ts. */
const REFERENCE_VIEWPORT = 1440;

type ItemCustom = { direction: number; opacity: number };

const GROUP_VARIANTS: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.055, delayChildren: 0.02 } },
  exit: { transition: { staggerChildren: 0.045, staggerDirection: -1 } },
};

/**
 * Os elementos da marca que sai descem pela base da tela e os da marca que
 * entra chegam pelo topo. Navegar para trás inverte os dois sentidos.
 */
const ITEM_VARIANTS: Variants = {
  initial: ({ direction }: ItemCustom) => ({
    y: direction >= 0 ? "-58vh" : "58vh",
    opacity: 0,
    scale: 0.86,
  }),
  animate: ({ opacity }: ItemCustom) => ({
    y: 0,
    opacity,
    scale: 1,
    transition: SPRING,
  }),
  exit: ({ direction }: ItemCustom) => ({
    y: direction >= 0 ? "58vh" : "-58vh",
    opacity: 0,
    scale: 0.86,
    transition: SPRING,
  }),
};

/** Escala a largura de referência para a viewport atual, sem JavaScript. */
function responsiveWidth(width: number): string {
  const min = Math.round(width * 0.42);
  const max = Math.round(width * 1.08);
  const relative = ((width / REFERENCE_VIEWPORT) * 100).toFixed(3);
  return `clamp(${min}px, ${relative}vw, ${max}px)`;
}

function DecorativeItem({
  element,
  direction,
  order,
}: {
  element: DecorativeElement;
  direction: number;
  order: number;
}) {
  const depth = element.depth ?? 1;
  const rotation = element.rotation ?? 0;

  return (
    <motion.div
      className="absolute"
      style={{ left: element.x, top: element.y, width: responsiveWidth(element.width) }}
      variants={ITEM_VARIANTS}
      custom={{ direction, opacity: element.opacity ?? 1 } satisfies ItemCustom}
    >
      {/*
        O parallax vive aqui, em variáveis CSS, para não disputar a propriedade
        `transform` com as animações de entrada/saída do Framer Motion.
      */}
      <div
        style={{
          transform: `translate(-50%, -50%) translate(calc(var(--parallax-x, 0px) * ${depth}), calc(var(--parallax-y, 0px) * ${depth})) rotate(${rotation}deg)`,
        }}
      >
        <motion.img
          src={element.src}
          alt=""
          draggable={false}
          className="block w-full select-none"
          style={element.blur ? { filter: `blur(${element.blur}px)` } : undefined}
          animate={{ y: [0, -13, 0], rotate: [0, order % 2 === 0 ? -2.4 : 2.4, 0] }}
          transition={{
            duration: 4.6 + order * 0.85,
            delay: order * 0.28,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </motion.div>
  );
}

export default function DecorativeElements({
  brand,
  direction,
  parallaxX,
  parallaxY,
}: {
  brand: BrandConfig;
  direction: number;
  parallaxX: MotionValue<number>;
  parallaxY: MotionValue<number>;
}) {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apply = () => {
      const layer = layerRef.current;
      if (!layer) return;
      layer.style.setProperty("--parallax-x", `${parallaxX.get() * PARALLAX_X}px`);
      layer.style.setProperty("--parallax-y", `${parallaxY.get() * PARALLAX_Y}px`);
    };

    apply();
    const unsubscribeX = parallaxX.on("change", apply);
    const unsubscribeY = parallaxY.on("change", apply);
    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [parallaxX, parallaxY]);

  return (
    <div
      ref={layerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={brand.id}
          className="absolute inset-0"
          variants={GROUP_VARIANTS}
          initial="initial"
          animate="animate"
          exit="exit"
          custom={direction}
        >
          {(brand.decorativeElements ?? []).map((element, order) => (
            <DecorativeItem
              key={`${element.src}-${order}`}
              element={element}
              direction={direction}
              order={order}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
