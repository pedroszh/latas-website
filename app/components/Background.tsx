"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";

import type { BrandConfig } from "../data/brands";
import { withAlpha } from "../lib/color";
import { SPRING, panelOffset } from "../lib/motion";

type BackgroundProps = {
  brands: BrandConfig[];
  panel: MotionValue<number>;
  index: number;
};

function BackgroundPanel({
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
  const x = useTransform(panel, (position) => `${panelOffset(index, position, count) * 100}vw`);

  // A máscara dissolve as bordas do painel: sem ela, o corte do gradiente
  // radial aparece como uma linha vertical dura durante o deslize.
  const edgeMask = "linear-gradient(to right, transparent 0%, black 16%, black 84%, transparent 100%)";

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        x,
        backgroundImage: [
          `radial-gradient(120% 78% at 50% 64%, ${withAlpha(brand.accent, 0.26)} 0%, transparent 60%)`,
          `radial-gradient(60% 50% at 12% 12%, ${withAlpha(brand.accent, 0.16)} 0%, transparent 70%)`,
          `radial-gradient(70% 55% at 88% 90%, ${withAlpha(brand.accent, 0.14)} 0%, transparent 72%)`,
        ].join(", "),
        maskImage: edgeMask,
        WebkitMaskImage: edgeMask,
      }}
    />
  );
}

export default function Background({ brands, panel, index }: BackgroundProps) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        animate={{ backgroundColor: brands[index].background }}
        transition={SPRING}
      />

      {brands.map((brand, position) => (
        <BackgroundPanel
          key={brand.id}
          brand={brand}
          index={position}
          panel={panel}
          count={brands.length}
        />
      ))}

      {/* Vinheta: mantém o foco no centro da composição. */}
      <div className="absolute inset-0 bg-[radial-gradient(110%_85%_at_50%_50%,transparent_38%,rgba(0,0,0,0.55)_100%)]" />
    </div>
  );
}
