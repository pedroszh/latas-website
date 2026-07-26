"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";

import type { BrandConfig } from "../data/brands";
import { panelOffset } from "../lib/motion";

/**
 * O título desliza mais rápido que o fundo (128vw contra 100vw): é o que cria a
 * sensação de profundidade entre as camadas durante a troca de marca.
 */
const TITLE_TRAVEL = 128;

function TitlePanel({
  brand,
  index,
  panel,
  count,
}: {
  brand: BrandConfig;
  index: number;
  panel: MotionValue<number>;
  count: number;
}) {
  const x = useTransform(
    panel,
    (position) => `${panelOffset(index, position, count) * TITLE_TRAVEL}vw`,
  );

  return (
    <motion.div className="absolute inset-0 flex items-center justify-center" style={{ x }}>
      <span
        className="font-display block leading-[0.78] tracking-[-0.035em] whitespace-nowrap select-none"
        style={{ fontSize: brand.titleSize, color: brand.titleColor }}
      >
        {brand.title}
      </span>
    </motion.div>
  );
}

export default function BrandTitle({
  brands,
  panel,
}: {
  brands: BrandConfig[];
  panel: MotionValue<number>;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {brands.map((brand, index) => (
        <TitlePanel
          key={brand.id}
          brand={brand}
          index={index}
          panel={panel}
          count={brands.length}
        />
      ))}
    </div>
  );
}
