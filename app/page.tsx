"use client";

import { useCallback, useEffect } from "react";

import Background from "./components/Background";
import BrandHud from "./components/BrandHud";
import BrandTitle from "./components/BrandTitle";
import CanStage from "./components/CanStage";
import DecorativeElements from "./components/DecorativeElements";
import { BRANDS } from "./data/brands";
import { useBrandCarousel } from "./hooks/useBrandCarousel";
import { usePointerParallax } from "./hooks/usePointerParallax";

export default function Home() {
  const { panel, index, direction, goTo, settle, halt } = useBrandCarousel(BRANDS.length);
  const { x: parallaxX, y: parallaxY } = usePointerParallax();

  const brand = BRANDS[index];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(-1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goTo]);

  const handleTap = useCallback(() => goTo(1), [goTo]);

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-black text-white">
      <Background brands={BRANDS} panel={panel} index={index} />
      <BrandTitle brands={BRANDS} panel={panel} />

      <DecorativeElements
        brand={brand}
        direction={direction}
        parallaxX={parallaxX}
        parallaxY={parallaxY}
      />

      <CanStage
        brands={BRANDS}
        brand={brand}
        panel={panel}
        parallaxX={parallaxX}
        parallaxY={parallaxY}
        onGrab={halt}
        onRelease={settle}
        onTap={handleTap}
      />

      <BrandHud brands={BRANDS} brand={brand} index={index} onNavigate={goTo} />
    </main>
  );
}
