"use client";

import { AnimatePresence, motion } from "framer-motion";

import type { BrandConfig } from "../data/brands";
import { SPRING } from "../lib/motion";

type BrandHudProps = {
  brands: BrandConfig[];
  brand: BrandConfig;
  index: number;
  onNavigate: (delta: number) => void;
};

const LABEL = "text-[0.62rem] uppercase tracking-[0.32em] sm:text-[0.68rem]";

function Swap({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={id}
        className="block"
        initial={{ y: 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -14, opacity: 0 }}
        transition={SPRING}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );
}

export default function BrandHud({ brands, brand, index, onNavigate }: BrandHudProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex flex-col justify-between p-5 text-white sm:p-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-lg leading-none tracking-[0.08em] sm:text-2xl">AERO</p>
          <p className={`${LABEL} mt-2 text-white/55`}>Limited Can Series</p>
        </div>

        <div className="h-8 w-16 overflow-hidden sm:h-11 sm:w-24">
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={brand.id}
              src={brand.logo}
              alt={`Logo ${brand.name}`}
              className="h-full w-full object-contain object-right opacity-85 [filter:brightness(0)_invert(1)]"
              draggable={false}
              initial={{ y: -22, opacity: 0 }}
              animate={{ y: 0, opacity: 0.85 }}
              exit={{ y: 22, opacity: 0 }}
              transition={SPRING}
            />
          </AnimatePresence>
        </div>
      </header>

      <footer className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 overflow-hidden sm:max-w-[38%]">
          <div className={`${LABEL} text-white/55`}>
            <Swap id={`${brand.id}-eyebrow`}>{brand.eyebrow}</Swap>
          </div>
          <div className="mt-2 overflow-hidden text-xl leading-tight font-medium sm:text-3xl">
            <Swap id={`${brand.id}-tagline`}>{brand.tagline}</Swap>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-4 sm:gap-6">
          <div className={`${LABEL} tabular-nums text-white/55`}>
            {String(index + 1).padStart(2, "0")}
            <span className="mx-1 text-white/25">/</span>
            {String(brands.length).padStart(2, "0")}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate(-1)}
              aria-label="Marca anterior"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white/60 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path
                  d="M15 5 8 12l7 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onNavigate(1)}
              aria-label="Próxima marca"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white/60 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path
                  d="m9 5 7 7-7 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {brands.map((item, position) => (
              <span
                key={item.id}
                className={`${LABEL} transition-colors ${
                  position === index ? "text-white" : "text-white/30"
                }`}
              >
                {item.name}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
